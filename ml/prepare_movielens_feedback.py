"""Adapt the checked-in public MovieLens data to benchmark the feedback trainer.
This is research data, not consented TheMovie activity, and cannot be promoted.
"""
import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,default=Path('ml/private/movielens-benchmark.jsonl'))
    args=parser.parse_args()
    directory=Path('ml/data/ml-latest-small')
    with (directory/'links.csv').open() as file:
        ids={row['movieId']:int(float(row['tmdbId'])) for row in csv.DictReader(file) if row['tmdbId']}
    args.output.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
    count=0
    with args.output.open('x') as output, (directory/'ratings.csv').open() as file:
        args.output.chmod(0o600)
        for row in csv.DictReader(file):
            if row['movieId'] not in ids:
                continue
            event={'eventId':f"ml:{row['userId']}:{row['movieId']}:{row['timestamp']}",
                   'user':f"movielens:{row['userId']}",'id':ids[row['movieId']], 'type':'movie',
                   'kind':'rating','value':float(row['rating'])*2,
                   'at':datetime.fromtimestamp(int(row['timestamp']),timezone.utc).isoformat(),
                   'source':'movielens-benchmark'}
            output.write(json.dumps(event)+'\n')
            count+=1
    print(f'Prepared {count} public benchmark ratings; these are not application feedback.')


if __name__=='__main__':
    main()
