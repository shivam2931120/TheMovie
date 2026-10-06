"""Learn support-adjusted movie/TV similarities from consented event exports.
Select on validation only. Never infer dislikes from impressions or missing events.
"""
import argparse
import hashlib
import json
import math
import platform
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict

import numpy as np
import scipy
import sklearn
from scipy.sparse import csr_matrix, diags, issparse
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import normalize

WEIGHTS = {'click': .3, 'watchlist': 1., 'watch': 1.5, 'rewatch': 2., 'episode': .5}
KINDS = set(WEIGHTS) | {'rating', 'dismiss', 'impression'}
CONFIGS = [
    {'name': 'svd_32', 'algorithm': 'svd', 'components': 32, 'idf': False},
    {'name': 'svd_32_idf', 'algorithm': 'svd', 'components': 32, 'idf': True},
    {'name': 'svd_64_idf', 'algorithm': 'svd', 'components': 64, 'idf': True},
    {'name': 'item_cosine_idf', 'algorithm': 'item_cosine', 'components': 0, 'idf': True},
    {'name': 'rp3beta_06', 'algorithm': 'rp3beta', 'components': 0, 'idf': False, 'alpha': 1., 'beta': .6},
    {'name': 'rp3beta_03', 'algorithm': 'rp3beta', 'components': 0, 'idf': False, 'alpha': 1., 'beta': .3},
]
MIN_USERS = 50
MIN_GAIN = .005
SHRINKAGE = 5
MIN_SHARED_USERS = 2


def timestamp(event):
    value = datetime.fromisoformat(event['at'].replace('Z', '+00:00'))
    if value.tzinfo is None:
        raise ValueError('Event timestamps require a timezone')
    return value.timestamp()


def weight(event):
    if event['kind'] == 'dismiss':
        return 0. if event.get('value') == 0 else -2.
    if event['kind'] == 'rating':
        value = float(event.get('value') or 0)
        if not 1 <= value <= 10:
            return 0.
        return (value - 5) / 2 if value <= 4 or value >= 7 else 0.
    if event['kind'] == 'episode':
        return .5 * math.sqrt(min(20, max(1, float(event.get('value') or 1))))
    return WEIGHTS.get(event['kind'], 0.)


def load_events(path):
    events, skipped, duplicates = [], 0, 0
    known = set()
    for line in path.read_text().splitlines():
        if not line.strip():
            continue
        try:
            event = json.loads(line)
            if not isinstance(event, dict) or event.get('type') not in ('movie', 'tv'):
                raise ValueError()
            if type(event.get('id')) is not int or event['id'] <= 0 or not isinstance(event.get('user'), str) or not event['user']:
                raise ValueError()
            if event.get('kind') not in KINDS or not np.isfinite(timestamp(event)) or not np.isfinite(weight(event)):
                raise ValueError()
            if event.get('eventId'):
                identity = (event['user'], event['eventId'])
                if identity in known:
                    duplicates += 1
                    continue
                known.add(identity)
            events.append(event)
        except (ValueError, TypeError, KeyError, OverflowError):
            skipped += 1
    events.sort(key=lambda event: (timestamp(event), str(event.get('eventId', ''))))
    return events, {'invalid_events': skipped, 'duplicate_events': duplicates}


def aggregate(events, cutoff):
    """Cap repeated behavioral events per title/kind/day; explicit intent stays separate."""
    explicit, daily = {}, {}
    seen = defaultdict(set)
    for event in events:
        at = timestamp(event)
        if at > cutoff:
            continue
        key = (event['user'], f"{event['type']}:{event['id']}")
        w = weight(event)
        if event['kind'] != 'impression':
            seen[key[0]].add(key[1])
        if event['kind'] in ('rating', 'dismiss'):
            explicit[key + (event['kind'],)] = w
        elif w > 0:
            decay = max(.3, math.exp(-(cutoff - at) / 86400 / 180))
            bucket = key + (event['kind'], int(at // 86400))
            daily[bucket] = max(daily.get(bucket, 0.), w * decay)
    interactions = defaultdict(float)
    for (user, item, _, _), w in daily.items():
        interactions[user, item] = min(6., interactions[user, item] + w)
    pairs = {(user, item) for user, item, _ in explicit}
    for key in pairs:
        rating, dismissal = explicit.get(key + ('rating',), 0.), explicit.get(key + ('dismiss',), 0.)
        if rating < 0 or dismissal < 0:
            interactions.pop(key, None)
        else:
            interactions[key] = min(8., interactions[key] + rating * 2)
    return {key: value for key, value in interactions.items() if value > 0}, seen


def media_neighbors(interactions, kind, config):
    """Fit each media type independently; movie activity cannot rescale TV taste."""
    selected = {key: value for key, value in interactions.items() if key[1].startswith(kind + ':')}
    users = sorted({key[0] for key in selected})
    items = sorted({key[1] for key in selected})
    if len(users) < 3 or len(items) < 3:
        return {}, []
    uidx, iidx = {key: i for i, key in enumerate(users)}, {key: i for i, key in enumerate(items)}
    matrix = csr_matrix(([np.log1p(w) for w in selected.values()],
                         ([uidx[u] for u, _ in selected], [iidx[i] for _, i in selected])),
                        shape=(len(users), len(items)))
    binary = matrix.copy()
    binary.data[:] = 1
    frequency = np.asarray(binary.sum(axis=0)).ravel()
    popularity = [items[i] for i in np.argsort(-frequency, kind='stable')]
    if config['idf']:
        matrix = matrix @ diags(np.log1p(len(users) / (frequency + 1)))
    if config['algorithm'] == 'rp3beta':
        # Three-hop recommendation reduces to item->user->item transitions
        # after a user history is applied. Binary transitions avoid treating
        # prolific repeat watchers as many independent supporters.
        user_to_item = normalize(binary, norm='l1', axis=1)
        item_to_user = normalize(binary.T, norm='l1', axis=1).tocsr()
        user_to_item.data **= config['alpha']
        item_to_user.data **= config['alpha']
        target_penalty = np.power(frequency, -config['beta'])
    else:
        matrix = normalize(matrix, axis=1)
        if config['algorithm'] == 'item_cosine':
            embeddings = normalize(matrix.T, axis=1)
        elif config['algorithm'] == 'svd':
            dimensions = min(config['components'], len(users) - 1, len(items) - 1)
            embeddings = normalize(TruncatedSVD(n_components=dimensions, random_state=42).fit_transform(matrix.T))
        else:
            raise ValueError(f"Unknown model algorithm: {config['algorithm']}")
    neighbors = {}
    indices = np.arange(len(items))
    for start in range(0, len(items), 128):
        block = indices[start:start + 128]
        similarities = (item_to_user[block] @ user_to_item) if config['algorithm'] == 'rp3beta' else embeddings[block] @ embeddings.T
        if issparse(similarities):
            similarities = similarities.toarray()
        shared = (binary[:, block].T @ binary).toarray()
        similarities = np.maximum(similarities, 0)
        similarities[np.arange(len(block)), block] = 0
        similarities[shared < MIN_SHARED_USERS] = 0
        if config['algorithm'] == 'rp3beta':
            similarities *= target_penalty
            # Export positive bounded ranking weights compatible with the
            # runtime graph combiner, not calibrated match probabilities.
            scale = similarities.max(axis=1, keepdims=True)
            similarities /= np.maximum(scale, np.finfo(float).eps)
        scores = similarities * shared / (shared + SHRINKAGE)
        for row, index in enumerate(block):
            order = np.argsort(-scores[row], kind='stable')
            neighbors[items[index]] = [
                {'id': items[j], 'score': round(float(scores[row, j]), 6), 'support': int(shared[row, j])}
                for j in order if j != index and shared[row, j] >= MIN_SHARED_USERS and scores[row, j] > 0
            ][:40]
    return neighbors, popularity


def fit(events, cutoff, config=None):
    config = config or CONFIGS[0]
    interactions, seen = aggregate(events, cutoff)
    neighbors, popularity = {}, []
    for kind in ('movie', 'tv'):
        graph, popular = media_neighbors(interactions, kind, config)
        neighbors.update(graph)
        popularity.extend(popular)
    if not neighbors:
        raise ValueError('Need at least three users and three positive titles within one media type.')
    return neighbors, popularity, interactions, seen


def edges(values):
    for rank, edge in enumerate(values):
        yield (edge['id'], edge['score']) if isinstance(edge, dict) else (edge, 1 / np.sqrt(rank + 1))


def evaluate(model, future, reference=None, return_per_user=False):
    graph, popularity, interactions, seen = model
    history = defaultdict(dict)
    for (user, item), w in interactions.items():
        history[user][item] = w
    future_interactions, _ = aggregate(future, max((timestamp(event) for event in future), default=0))
    relevant = defaultdict(set)
    for (user, item), w in future_interactions.items():
        if w >= 1:
            relevant[user].add(item)
    totals, served = defaultdict(list), defaultdict(set)
    per_user = {'movie': {}, 'tv': {}}
    available = set(popularity)
    frequency = defaultdict(int)
    for _, item in interactions:
        frequency[item] += 1
    long_tail = set()
    for kind in ('movie', 'tv'):
        ranked = [item for item in popularity if item.startswith(kind + ':')]
        long_tail.update(ranked[math.ceil(len(ranked) * .2):])
    active_graph = reference if reference is not None else graph
    for user, positives in relevant.items():
        targets = positives - seen[user]
        scores = defaultdict(float)
        for item, w in history[user].items():
            for candidate, similarity in edges(active_graph.get(item, [])):
                scores[candidate] += w * similarity
        candidates = sorted(scores, key=lambda item: (-scores[item], item)) if active_graph else popularity
        for kind in ('movie', 'tv'):
            if sum(item.startswith(kind + ':') for item in history[user]) < 3:
                continue
            truth = {item for item in targets if item.startswith(kind + ':')}
            if not truth:
                continue
            recs = [item for item in candidates if item not in seen[user] and item.startswith(kind + ':')][:20]
            hits = len(set(recs) & truth)
            dcg = sum(1 / np.log2(rank + 2) for rank, item in enumerate(recs) if item in truth)
            ideal = sum(1 / np.log2(rank + 2) for rank in range(min(20, len(truth))))
            tail_fraction = sum(item in long_tail for item in recs) / max(1, len(recs))
            mean_popularity = np.mean([frequency[item] for item in recs]) if recs else 0.
            totals[kind].append((dcg / ideal, hits / len(truth), hits / 20, int(hits > 0), len(truth & available) / len(truth), tail_fraction, mean_popularity, len(recs)))
            per_user[kind][user] = dcg / ideal
            served[kind].update(recs)
    result = {}
    for kind in ('movie', 'tv'):
        values = totals[kind]
        means = np.mean(values, axis=0) if values else [0.] * 8
        result[kind] = dict(zip(['ndcg_at_20', 'recall_at_20', 'precision_at_20', 'hit_rate', 'relevant_catalog_coverage', 'long_tail_fraction', 'mean_recommended_training_users', 'mean_results'], map(float, means)))
        result[kind].update(users=len(values), catalog_coverage=len(served[kind] & available) / max(1, sum(item.startswith(kind + ':') for item in available)))
    return (result, per_user) if return_per_user else result


def paired_gain(candidate, baseline, samples=2000):
    users = sorted(set(candidate) & set(baseline))
    if not users:
        return {'users': 0, 'mean': 0., 'lower_95': None, 'upper_95': None}
    differences = np.array([candidate[user] - baseline[user] for user in users])
    rng = np.random.default_rng(42)
    # Work in small batches so larger exports do not allocate samples*users.
    draws = []
    for start in range(0, samples, 100):
        indices = rng.integers(len(users), size=(min(100, samples-start), len(users)))
        draws.extend(differences[indices].mean(axis=1))
    lower, upper = np.quantile(draws, [.025, .975])
    return {'users': len(users), 'mean': float(differences.mean()), 'lower_95': float(lower), 'upper_95': float(upper)}


def reference_graph(legacy, feedback):
    result = {f'movie:{item}': [f'movie:{i}' for i in values] for item, values in legacy.items()}
    for kind in ('movie', 'tv'):
        for item, values in feedback.get(kind, {}).items():
            candidates = defaultdict(float)
            sources = [(result.get(f'{kind}:{item}', []), .8), (values, 1.)]
            total = sum(w for values, w in sources if values)
            for values, w in sources:
                for rank, edge in enumerate(values):
                    if isinstance(edge, dict):
                        candidate = f"{kind}:{edge['id']}"
                        score = edge['score']
                    else:
                        candidate = edge if isinstance(edge, str) and ':' in edge else f'{kind}:{edge}'
                        score = 1 / np.sqrt(rank + 1)
                    candidates[candidate] += w * score
            result[f'{kind}:{item}'] = [{'id': item, 'score': score / total} for item, score in sorted(candidates.items(), key=lambda pair: (-pair[1], pair[0]))[:60]]
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('events', type=Path)
    parser.add_argument('--output', type=Path, help='New private candidate path; defaults to a timestamped path')
    parser.add_argument('--promote', action='store_true')
    args = parser.parse_args()
    if args.output is None:
        args.output = Path('ml/private') / f"feedback-candidate-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')}.json"
    # Candidate export must never bypass --promote, even via symlinks.
    destination = args.output.resolve()
    if destination.is_relative_to(Path('src').resolve()) or destination == args.events.resolve():
        raise SystemExit('Candidate output must be outside src/ and must not replace the input export.')
    if destination.exists():
        raise SystemExit('Candidate output already exists; choose a new --output path for this experiment.')
    events, quality = load_events(args.events)
    benchmark=any(event.get('source')=='movielens-benchmark' for event in events)
    if args.promote and benchmark:
        raise SystemExit('Promotion blocked: public benchmark events are not consented application feedback.')
    if len(events) < 200:
        raise SystemExit(f'Not trained: {len(events)} valid consented events; need at least 200. No model was promoted.')
    validation_start, test_start = timestamp(events[int(len(events) * .7)]), timestamp(events[int(len(events) * .85)])
    train = [e for e in events if timestamp(e) < validation_start]
    validation = [e for e in events if validation_start <= timestamp(e) < test_start]
    test = [e for e in events if timestamp(e) >= test_start]
    if not train or not validation or not test:
        raise SystemExit('Not trained: need three nonempty chronological windows; timestamp ties cannot be split.')
    previous = json.loads(Path('src/data/feedback-recommendations.json').read_text())
    reference = reference_graph(json.loads(Path('src/data/recommendations.json').read_text()), previous)
    validation_candidates, first_models = {}, {}
    try:
        for config in CONFIGS:
            first_models[config['name']] = fit(train, validation_start, config)
            validation_candidates[config['name']] = evaluate(first_models[config['name']], validation)
    except ValueError as error:
        raise SystemExit(f'Not trained: {error}') from error
    selected = {kind: max(CONFIGS, key=lambda config: validation_candidates[config['name']][kind]['ndcg_at_20']) for kind in ('movie', 'tv')}
    development = {config['name']: fit(train + validation, test_start, config) for config in selected.values()}
    val, held, val_pop, test_pop, val_current, test_current = {}, {}, {}, {}, {}, {}
    approved, blocked, confidence = [], {}, {}
    for kind, config in selected.items():
        first, model = first_models[config['name']], development[config['name']]
        val[kind] = validation_candidates[config['name']][kind]
        validation_metrics, validation_users = evaluate(first, validation, return_per_user=True)
        test_metrics, test_users = evaluate(model, test, return_per_user=True)
        validation_pop_metrics, validation_pop_users = evaluate(first, validation, {}, return_per_user=True)
        test_pop_metrics, test_pop_users = evaluate(model, test, {}, return_per_user=True)
        validation_current_metrics, validation_current_users = evaluate(first, validation, reference, return_per_user=True)
        test_current_metrics, test_current_users = evaluate(model, test, reference, return_per_user=True)
        val[kind], held[kind] = validation_metrics[kind], test_metrics[kind]
        val_pop[kind], test_pop[kind] = validation_pop_metrics[kind], test_pop_metrics[kind]
        val_current[kind], test_current[kind] = validation_current_metrics[kind], test_current_metrics[kind]
        confidence[kind] = {
            'validation_popularity': paired_gain(validation_users[kind], validation_pop_users[kind]),
            'validation_current': paired_gain(validation_users[kind], validation_current_users[kind]),
            'test_popularity': paired_gain(test_users[kind], test_pop_users[kind]),
            'test_current': paired_gain(test_users[kind], test_current_users[kind]),
        }
        reasons = []
        if min(val[kind]['users'], held[kind]['users']) < MIN_USERS:
            reasons.append('Fewer than 50 eligible users in validation or held-out window')
        for label, candidate, baselines in [('validation', val[kind], [val_pop[kind], val_current[kind]]), ('held_out', held[kind], [test_pop[kind], test_current[kind]])]:
            if candidate['ndcg_at_20'] - max(b['ndcg_at_20'] for b in baselines) < MIN_GAIN:
                reasons.append(f'{label}: NDCG gain over both baselines is below {MIN_GAIN}')
        for comparator, interval in confidence[kind].items():
            if interval['lower_95'] is None or interval['lower_95'] <= 0:
                reasons.append(f'{comparator}: paired NDCG gain is not positive at the 95% bootstrap interval lower bound')
        if reasons:
            blocked[kind] = reasons
        else:
            approved.append(kind)
    report = {'implementation_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'dataset_sha256': hashlib.sha256(args.events.read_bytes()).hexdigest(), 'data_quality': quality,
              'data_origin':'public_movielens_benchmark' if benchmark else 'consented_application_export',
              'reference_provenance':'Retrospective shipped-artifact comparator; a strictly historical training cutoff is not established for the shipped graph.',
              'versions': {'python': platform.python_version(), 'numpy': np.__version__, 'scipy': scipy.__version__, 'sklearn': sklearn.__version__},
              'train_events': len(train), 'validation_events': len(validation), 'test_events': len(test),
              'validation_cutoff': validation_start, 'test_cutoff': test_start, 'candidate_configs': CONFIGS, 'training_scope': 'Independent movie and TV matrices',
              'ranking_weight_contract': 'Positive, bounded neighbor scores with co-user support; RP3beta is row-max-scaled before support shrinkage, not a probability.',
              'long_tail_definition': 'Bottom 80% of each training media catalog ordered by distinct positive users; eligible zero-result users stay in metric averages.',
              'selected_configs': selected, 'validation_candidates': validation_candidates, 'validation': val, 'test': held,
              'validation_popularity': val_pop, 'test_popularity': test_pop, 'validation_current': val_current, 'test_current': test_current,
              'paired_ndcg_gain_intervals': confidence, 'bootstrap': {'samples': 2000, 'seed': 42, 'unit': 'eligible user', 'interpretation': 'Paired percentile bootstrap; validation intervals are exploratory after configuration selection.'},
              'approved_media': approved, 'blocked_media': blocked,
              'protocol': 'Global temporal 70/15/15; ties in later windows; select configuration independently per media on validation only; refit on development before held-out evaluation; all seen titles excluded; at least three prior positives per media; zero-result users included; independent movie/TV matrices; six SVD/cosine/RP3beta configurations; similarities require two shared users and shrinkage=5; minimum 50 users per media/window, NDCG gain >=0.005 over popularity and shipped graph, and positive paired-bootstrap lower bounds for both comparators in both windows. TMDB live retrieval is not evaluated by this offline protocol.'}
    artifact = {'version': 2, 'movie': {}, 'tv': {}, 'trainedAt': datetime.now(timezone.utc).isoformat(), 'metrics': report}
    full_models = {config['name']: fit(events, timestamp(events[-1]), config) for config in selected.values()}
    for kind, config in selected.items():
        for item, values in full_models[config['name']][0].items():
            if not item.startswith(kind + ':'):
                continue
            artifact[kind][item.split(':')[1]] = [{**edge, 'id': int(edge['id'].split(':')[1])} for edge in values]
    args.output.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    with args.output.open('x') as file:
        args.output.chmod(0o600)
        file.write(json.dumps(artifact, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    if args.promote:
        if not approved:
            raise SystemExit('Promotion blocked: see blocked_media in the candidate report.')
        for kind in approved:
            previous[kind] = artifact[kind]
        previous.update(version=2, trainedAt=artifact['trainedAt'], metrics=report)
        Path('src/data/feedback-recommendations.json').write_text(json.dumps(previous, separators=(',', ':')) + '\n')
        print('Promoted media:', ', '.join(approved))


if __name__ == '__main__':
    main()
