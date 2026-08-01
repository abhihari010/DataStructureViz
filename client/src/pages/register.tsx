import { useState } from "react";
import { Helmet } from "react-helmet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { AuthLayout } from "@/components/auth-layout";
import { useToast } from "@/hooks/use-toast";
import { auth, getApiErrorMessage } from "@/lib/api";

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Enter your first name."),
    lastName: z.string().trim().min(1, "Enter your last name."),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .email("Enter a valid email address."),
    password: z.string().min(6, "Password must contain at least 6 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const registerSteps = [
  { label: "Name", detail: "Label your path" },
  { label: "Email", detail: "Set the address" },
  { label: "Key", detail: "Create a password" },
  { label: "Match", detail: "Confirm the key" },
  { label: "Ready", detail: "Create the account" },
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const values = form.watch();
  const hasName = Boolean(values.firstName.trim() && values.lastName.trim());
  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);
  const hasPassword = values.password.length >= 6;
  const passwordsMatch =
    hasPassword &&
    values.confirmPassword.length > 0 &&
    values.confirmPassword === values.password;
  const activeStep =
    hasName && hasEmail && hasPassword && passwordsMatch
      ? 4
      : hasName && hasEmail && hasPassword
        ? 3
        : hasName && hasEmail
          ? 2
          : hasName
            ? 1
            : 0;
  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setServerError(null);

    try {
      await auth.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      toast({
        title: "Account created",
        description:
          "Check your email to verify the account before signing in. Check spam if it is not in your inbox.",
      });

      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    } catch (error) {
      const isDuplicateEmail =
        axios.isAxiosError(error) && error.response?.status === 409;
      const errorMessage = getApiErrorMessage(
        error,
        isDuplicateEmail
          ? "An account with this email already exists. Try signing in or resetting your password."
          : "Your account could not be created. Try again.",
      );

      setServerError(errorMessage);
      window.scrollTo({ top: 0 });
      toast({
        variant: "destructive",
        title: "Account not created",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Create account | DSA Visualizer</title>
        <meta
          name="description"
          content="Create a DSA Visualizer account and begin learning through interactive algorithm visualizations."
        />
      </Helmet>

      <AuthLayout
        activeStep={activeStep}
        description="Create the account you will use for visual lessons and practice."
        mode="register"
        steps={registerSteps}
        switchHref="/login"
        switchLabel="Sign in"
        switchPrompt="Already have an account?"
        title="Start your path."
      >
        <form
          className="auth-form"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          {serverError && (
            <div className="auth-alert" role="alert">
              <AlertCircle aria-hidden="true" />
              <p>{serverError}</p>
            </div>
          )}

          <div className="auth-name-grid">
            <div className="auth-field">
              <div className="auth-field-label-row">
                <label htmlFor="register-first-name">First name</label>
              </div>
              <div className="auth-input-wrap">
                <UserRound aria-hidden="true" />
                <input
                  {...form.register("firstName")}
                  id="register-first-name"
                  className="auth-input"
                  placeholder="Ada"
                  autoComplete="given-name"
                  disabled={isLoading}
                  autoFocus
                  aria-invalid={Boolean(form.formState.errors.firstName)}
                  aria-describedby={
                    form.formState.errors.firstName
                      ? "register-first-name-error"
                      : undefined
                  }
                />
              </div>
              {form.formState.errors.firstName && (
                <p className="auth-field-error" id="register-first-name-error">
                  <AlertCircle aria-hidden="true" />
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="auth-field">
              <div className="auth-field-label-row">
                <label htmlFor="register-last-name">Last name</label>
              </div>
              <div className="auth-input-wrap">
                <UserRound aria-hidden="true" />
                <input
                  {...form.register("lastName")}
                  id="register-last-name"
                  className="auth-input"
                  placeholder="Lovelace"
                  autoComplete="family-name"
                  disabled={isLoading}
                  aria-invalid={Boolean(form.formState.errors.lastName)}
                  aria-describedby={
                    form.formState.errors.lastName
                      ? "register-last-name-error"
                      : undefined
                  }
                />
              </div>
              {form.formState.errors.lastName && (
                <p className="auth-field-error" id="register-last-name-error">
                  <AlertCircle aria-hidden="true" />
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="auth-field">
            <div className="auth-field-label-row">
              <label htmlFor="register-email">Email address</label>
            </div>
            <div className="auth-input-wrap">
              <Mail aria-hidden="true" />
              <input
                {...form.register("email")}
                id="register-email"
                className="auth-input"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                disabled={isLoading}
                aria-invalid={Boolean(form.formState.errors.email)}
                aria-describedby={
                  form.formState.errors.email ? "register-email-error" : undefined
                }
              />
            </div>
            {form.formState.errors.email && (
              <p className="auth-field-error" id="register-email-error">
                <AlertCircle aria-hidden="true" />
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="auth-field">
            <div className="auth-field-label-row">
              <label htmlFor="register-password">Password</label>
            </div>
            <div className="auth-input-wrap auth-input-wrap--password">
              <LockKeyhole aria-hidden="true" />
              <input
                {...form.register("password")}
                id="register-password"
                className="auth-input"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isLoading}
                aria-invalid={Boolean(form.formState.errors.password)}
                aria-describedby={
                  form.formState.errors.password
                    ? "register-password-error"
                    : "register-password-hint"
                }
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
            <p className="auth-password-hint" id="register-password-hint">
              Use 6 or more characters.
            </p>
            {form.formState.errors.password && (
              <p className="auth-field-error" id="register-password-error">
                <AlertCircle aria-hidden="true" />
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="auth-field">
            <div className="auth-field-label-row">
              <label htmlFor="register-confirm-password">Confirm password</label>
            </div>
            <div className="auth-input-wrap auth-input-wrap--password">
              <LockKeyhole aria-hidden="true" />
              <input
                {...form.register("confirmPassword")}
                id="register-confirm-password"
                className="auth-input"
                type={showConfirmation ? "text" : "password"}
                autoComplete="new-password"
                disabled={isLoading}
                aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                aria-describedby={
                  form.formState.errors.confirmPassword
                    ? "register-confirm-password-error"
                    : undefined
                }
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmation((visible) => !visible)}
                aria-label={
                  showConfirmation ? "Hide confirmed password" : "Show confirmed password"
                }
                aria-pressed={showConfirmation}
              >
                {showConfirmation ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="auth-field-error" id="register-confirm-password-error">
                <AlertCircle aria-hidden="true" />
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            <span>Create account</span>
            {isLoading ? (
              <LoaderCircle className="is-spinning" aria-hidden="true" />
            ) : (
              <ArrowRight aria-hidden="true" />
            )}
          </button>
        </form>

        <p className="auth-form-switch">
          Already registered?
          <Link href="/login">Sign in</Link>
        </p>
      </AuthLayout>
    </>
  );
}
