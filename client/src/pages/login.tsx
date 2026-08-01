import { useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Send,
} from "lucide-react";
import { Link } from "wouter";
import { AuthLayout } from "@/components/auth-layout";
import { useToast } from "@/hooks/use-toast";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import api, { getApiErrorMessage } from "@/lib/api";

type LoginFormData = {
  email: string;
  password: string;
};

const loginSteps = [
  { label: "Locate", detail: "Find your account" },
  { label: "Verify", detail: "Match your key" },
  { label: "Enter", detail: "Open the workspace" },
];

const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export default function Login() {
  const { login } = useAuthJWT();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    resetField,
    watch,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = watch("email");
  const password = watch("password");
  const emailLooksValid = emailPattern.test(email);
  const activeStep = emailLooksValid ? (password.length >= 6 ? 2 : 1) : 0;

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsEmailNotVerified(false);

    try {
      await login(data);
    } catch (error: any) {
      resetField("password");

      let errorMessage = "Something interrupted sign in. Try again.";

      if (error?.response?.data?.message) {
        errorMessage = getApiErrorMessage(error, errorMessage);
        if (
          error.response.data.needsVerification === true ||
          error.response.data.needsVerification === "true"
        ) {
          setIsEmailNotVerified(true);
          setUserEmail(error.response.data.email || data.email);
        }
      } else if (error?.response?.status === 401) {
        errorMessage = getApiErrorMessage(
          error,
          "Email or password is incorrect.",
        );
      } else if (error?.message) {
        errorMessage = getApiErrorMessage(error, error.message);
      }

      setServerError(errorMessage);
      window.scrollTo({ top: 0 });

      if (error?.response?.status !== 401) {
        toast({
          variant: "destructive",
          title: "Sign in stopped",
          description: errorMessage,
        });
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      await api.post("/auth/resend-verification", { email: userEmail });
      toast({
        title: "Verification email sent",
        description: "Check your inbox and spam folder for the verification link.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Email not sent",
        description: getApiErrorMessage(
          error,
          "The verification email could not be sent. Try again.",
        ),
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign in | DSA Visualizer</title>
        <meta
          name="description"
          content="Sign in to continue learning data structures and algorithms with interactive visualizations."
        />
      </Helmet>

      <AuthLayout
        activeStep={activeStep}
        description="Use the email and password connected to your learning workspace."
        mode="login"
        steps={loginSteps}
        switchHref="/register"
        switchLabel="Create account"
        switchPrompt="New to the visualizer?"
        title="Welcome back."
      >
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {serverError && (
            <div
              className={`auth-alert ${isEmailNotVerified ? "auth-alert--verification" : ""}`}
              role="alert"
            >
              <AlertCircle aria-hidden="true" />
              <div>
                <p>{serverError}</p>
                {isEmailNotVerified && (
                  <button
                    type="button"
                    className="auth-inline-action"
                    onClick={handleResendVerification}
                  >
                    <Send aria-hidden="true" />
                    Resend verification email
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="auth-field">
            <div className="auth-field-label-row">
              <label htmlFor="login-email">Email address</label>
            </div>
            <div className="auth-input-wrap">
              <Mail aria-hidden="true" />
              <input
                id="login-email"
                className="auth-input"
                placeholder="name@example.com"
                type="email"
                disabled={isSubmitting}
                autoComplete="email"
                autoFocus
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                {...register("email", {
                  required: "Enter your email address.",
                  pattern: {
                    value: emailPattern,
                    message: "Enter a valid email address.",
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="auth-field-error" id="login-email-error">
                <AlertCircle aria-hidden="true" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="auth-field">
            <div className="auth-field-label-row">
              <label htmlFor="login-password">Password</label>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
            <div className="auth-input-wrap auth-input-wrap--password">
              <LockKeyhole aria-hidden="true" />
              <input
                id="login-password"
                className="auth-input"
                type={showPassword ? "text" : "password"}
                disabled={isSubmitting}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                {...register("password", {
                  required: "Enter your password.",
                  minLength: {
                    value: 6,
                    message: "Password must contain at least 6 characters.",
                  },
                })}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </div>
            {errors.password && (
              <p className="auth-field-error" id="login-password-error">
                <AlertCircle aria-hidden="true" />
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            <span>Sign in</span>
            {isSubmitting ? (
              <LoaderCircle className="is-spinning" aria-hidden="true" />
            ) : (
              <ArrowRight aria-hidden="true" />
            )}
          </button>
        </form>

        <p className="auth-form-switch">
          Need an account?
          <Link href="/register">Create one</Link>
        </p>
      </AuthLayout>
    </>
  );
}
