const fs = require('fs');

const parts = [
  "'use client';\n\n",
  "import React, { useState, useRef } from 'react';\n",
  "import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, type Variants, type Transition } from 'framer-motion';\n",
  "import { Lock, Mail, User, ArrowRight, Eye, EyeOff, Sparkles, ShieldCheck, Activity, CheckCircle2, AlertCircle, Loader2, Stethoscope, ChevronLeft } from 'lucide-react';\n",
  "import { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } from '@/lib/firebase';\n",
  "import Link from 'next/link';\n\n",
  "interface AuthPortalProps {\n  initialMode?: 'login' | 'register';\n}\n\n",
  "export default function AuthPortal({ initialMode = 'login' }: AuthPortalProps) {\n",
  "  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);\n",
  "  const [email, setEmail] = useState('');\n",
  "  const [password, setPassword] = useState('');\n",
  "'  const [fullName, setFullName] = useState('');\n",
  "  const [confirmPassword, setConfirmPassword] = useState('');\n",
  "  const [showPassword, setShowPassword] = useState(false);\n",
  "  const [loading, setLoading] = useState(false);\n",
  "  const [googleLoading, setGoogleLoading] = useState(false);\n",
  "'  const [error, setError] = useState<string | null>(null);\n",
  "  const [successMsg, setSuccessMsg] = useState<string | null>(null);\n",
  "  const [shakeTrigger, setShakeTrigger] = useState(0);\n\n"]
