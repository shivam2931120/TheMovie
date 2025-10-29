import { SignIn, SignUp, UserButton as ClerkUserButton, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import Container from "./Container"; // Assuming this is your wrapper component

// --- ProtectedRoute component ---
export function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser(); 
  
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}

export function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 py-12">
      <Container>
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-neutral-900 border border-neutral-800"
              }
            }}
            routing="path" 
            path="/sign-in" 
            signUpUrl="/sign-up"
            afterSignInUrl="/"
          />
        </div>
      </Container>
    </div>
  );
}

export function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 py-12">
      <Container>
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-neutral-900 border border-neutral-800"
              }
            }}
            routing="path" 
            path="/sign-up" 
            signInUrl="/sign-in"
            afterSignUpUrl="/"
          />
        </div>
      </Container>
    </div>
  );
}
export { ClerkUserButton as UserButton };