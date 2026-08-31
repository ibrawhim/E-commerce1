import { useState } from "react";

const RULES = [
  {
    id:      "length",
    label:   "At least 8 characters",
    test:    (v) => v.length >= 8,
  },
  {
    id:      "number",
    label:   "At least one number",
    test:    (v) => /\d/.test(v),
  },
  {
    id:      "symbol",
    label:   "At least one symbol (!@#$%^&*...)",
    test:    (v) => /[^a-zA-Z0-9]/.test(v),
  },
];

const PHONE_RE = /^[+]?[\d\s()-]{7,20}$/;
const BIO_MAX_LENGTH = 300;

export function useSignUpForm() {
  const [values, setValues] = useState({
    firstName: "",
    lastName:  "",
    email:     "",
    phone:     "",
    bio:       "",
    password:  "",
  });

  const [touched, setTouched]           = useState({});
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  const passwordRules = RULES.map((rule) => ({
    ...rule,
    passed: rule.test(values.password),
  }));

  const passwordValid  = passwordRules.every((r) => r.passed);
  const showRules      = touched.password && values.password.length > 0;

  const errors = {
    firstName: touched.firstName && !values.firstName.trim()
      ? "First name is required"
      : "",
    lastName: touched.lastName && !values.lastName.trim()
      ? "Last name is required"
      : "",
    email: touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
      ? "Enter a valid email address"
      : "",
    phone: touched.phone && !PHONE_RE.test(values.phone.trim())
      ? "Enter a valid phone number"
      : "",
    // bio is optional — only flag it if it's over the length limit
    bio: touched.bio && values.bio.length > BIO_MAX_LENGTH
      ? `Bio must be ${BIO_MAX_LENGTH} characters or fewer`
      : "",
    password: touched.password && !passwordValid
      ? "Password does not meet all requirements"
      : "",
  };

  const isFormValid =
    values.firstName.trim() &&
    values.lastName.trim()  &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) &&
    PHONE_RE.test(values.phone.trim()) &&
    values.bio.length <= BIO_MAX_LENGTH &&
    passwordValid;

  function getPayload() {
    return {
      firstName: values.firstName.trim(),
      lastName:  values.lastName.trim(),
      email:     values.email.trim(),
      phone:     values.phone.trim(),
      bio:       values.bio.trim(),
      password:  values.password,
    };
  }

  function reset() {
    setValues({ firstName: "", lastName: "", email: "", phone: "", bio: "", password: "" });
    setTouched({});
  }

  return {
    values,
    touched,
    errors,
    showPassword,
    setShowPassword,
    handleChange,
    handleBlur,
    passwordRules,
    passwordValid,
    showRules,
    isFormValid,
    getPayload,
    reset,
    BIO_MAX_LENGTH,
  };
}