import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollInView } from '@/lib/useScrollInView';
import { ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { FaXTwitter, FaLinkedinIn, FaDribbble, FaGithub } from 'react-icons/fa6';
import { useToast } from '@/hooks/use-toast';

// Backend base URL — set VITE_API_URL in production (e.g. your Railway backend URL).
// Defaults to localhost:8080 so `npm run dev` works out of the box with no config.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FormData {
  name: string;
  email: string;
  project: string;
  budget: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  project?: string;
  budget?: string;
  message?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PROJECT_TYPES = [
  { value: 'Web Design',       label: 'Web Design' },
  { value: 'Web Development',  label: 'Web Development' },
  { value: 'Landing Page',     label: 'Landing Page' },
  { value: 'E-Commerce',       label: 'E-Commerce' },
  { value: 'Other',            label: 'Other' },
];

const BUDGET_OPTIONS = [
  { value: '₹10,000 – ₹25,000',       label: '₹10,000 – ₹25,000' },
  { value: '₹25,000 – ₹50,000',       label: '₹25,000 – ₹50,000' },
  { value: '₹50,000 – ₹1,00,000',     label: '₹50,000 – ₹1,00,000' },
  { value: '₹1,00,000 – ₹2,50,000',   label: '₹1,00,000 – ₹2,50,000' },
  { value: '₹2,50,000+',              label: '₹2,50,000+' },
  { value: 'Not Sure Yet',            label: 'Not Sure Yet' },
];

const EMPTY_FORM: FormData = { name: '', email: '', project: '', budget: '', message: '' };

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.name.trim())                  errors.name    = 'Name is required.';
  if (!data.email || !emailRe.test(data.email)) errors.email = 'Enter a valid email address.';
  if (!data.project)                      errors.project  = 'Please select a project type.';
  if (!data.budget)                       errors.budget   = 'Please select a budget range.';
  if (!data.message.trim())              errors.message  = 'Message is required.';
  else if (data.message.trim().length < 20) errors.message = 'Message must be at least 20 characters.';

  return errors;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function FloatingInput({
  id, type = 'text', label, value, onChange, error,
}: {
  id: string; type?: string; label: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div className="relative group">
      <input
        type={type} id={id} value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-[#050505] border rounded-lg px-4 pt-6 pb-2 text-white font-sans outline-none focus:ring-1 transition-all peer ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary focus:ring-primary'
        }`}
        placeholder=" "
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-4 text-muted-foreground text-sm transition-all peer-focus:text-xs peer-focus:top-2 peer-focus:text-primary peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:top-2"
      >
        {label}
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-400 flex items-center gap-1">
          <XCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  id, placeholder, options, value, onChange, error,
}: {
  id: string; placeholder: string; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-[#050505] border rounded-lg px-4 py-4 font-sans outline-none focus:ring-1 transition-all appearance-none ${
          value ? 'text-white' : 'text-muted-foreground'
        } ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary focus:ring-primary'
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-[#111] text-white">{o.label}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-400 flex items-center gap-1">
          <XCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Contact() {
  const { ref, inView } = useScrollInView({ threshold: 0.1, triggerOnce: true });
  const { toast } = useToast();

  const [form, setForm]         = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted]   = useState(false);

  const setField = (field: keyof FormData) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });

      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Unknown error');
      }

      // Success
      setIsSubmitted(true);
      setForm(EMPTY_FORM);

      toast({
        title:       '✓ Message Sent Successfully',
        description: "We'll be in touch within 24 hours.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message.';
      toast({
        title:       '❌ Failed to send message.',
        description: `${message} Please try again.`,
        variant:     'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-background relative border-t border-white/5 z-10">
      <div className="container mx-auto px-6 md:px-12" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h2 className="font-display font-bold text-5xl md:text-7xl text-white leading-[1.1] tracking-tight mb-6">
              LET'S BUILD<br />
              <span className="text-muted-foreground">SOMETHING</span><br />
              EXTRAORDINARY
            </h2>
            <p className="text-xl text-primary font-sans mb-16">We typically respond within 24 hours.</p>

            <div className="space-y-10">
              <div>
                <div className="text-xs tracking-widest text-muted-foreground uppercase mb-2">Email</div>
                <a href="mailto:soumya.rbehara007@gmail.com" className="group relative inline-block font-display text-2xl md:text-3xl text-white interactive">
                  soumya.rbehara007@gmail.com
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
                </a>
              </div>

              <div>
                <div className="text-xs tracking-widest text-muted-foreground uppercase mb-2">WhatsApp</div>
                <a href="#" className="font-display text-xl text-white hover:text-primary transition-colors interactive">
                  +91 XXXXX XXXXX
                </a>
              </div>

              <div>
                <div className="text-xs tracking-widest text-muted-foreground uppercase mb-2">Location</div>
                <div className="font-display text-xl text-white">
                  India<br />
                  <span className="text-muted-foreground text-lg">Remote Worldwide</span>
                </div>
              </div>

              <div className="pt-8 flex space-x-4">
                {[
                  { Icon: FaXTwitter,   href: '#' },
                  { Icon: FaLinkedinIn, href: '#' },
                  { Icon: FaDribbble,   href: '#' },
                  { Icon: FaGithub,     href: '#' },
                ].map((s, i) => (
                  <a
                    key={i} href={s.href}
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-300 interactive group"
                  >
                    <s.Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side — Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-card p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl"
            >
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="min-h-[400px] flex flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h3 className="font-display text-3xl text-white font-bold mb-4">Request Received</h3>
                    <p className="text-muted-foreground font-sans mb-8 max-w-xs">
                      We've received your project details. Check your inbox — we'll reply within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="text-sm text-primary hover:underline underline-offset-4 transition-all"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  /* ── Form fields ── */
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FloatingInput id="name"  label="Name"  value={form.name}  onChange={setField('name')}  error={errors.name} />
                      <FloatingInput id="email" label="Email" type="email" value={form.email} onChange={setField('email')} error={errors.email} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectField
                        id="project" placeholder="Project Type"
                        options={PROJECT_TYPES} value={form.project}
                        onChange={setField('project')} error={errors.project}
                      />
                      <SelectField
                        id="budget" placeholder="Budget Range"
                        options={BUDGET_OPTIONS} value={form.budget}
                        onChange={setField('budget')} error={errors.budget}
                      />
                    </div>

                    {/* Message */}
                    <div className="relative group">
                      <textarea
                        id="message" rows={4} value={form.message}
                        onChange={e => setField('message')(e.target.value)}
                        className={`w-full bg-[#050505] border rounded-lg px-4 pt-6 pb-2 text-white font-sans outline-none focus:ring-1 transition-all peer resize-none ${
                          errors.message
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-white/10 focus:border-primary focus:ring-primary'
                        }`}
                        placeholder=" "
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                      <label
                        htmlFor="message"
                        className="absolute left-4 top-4 text-muted-foreground text-sm transition-all peer-focus:text-xs peer-focus:top-2 peer-focus:text-primary peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:top-2"
                      >
                        Tell us about your project
                      </label>
                      <div className="flex items-start justify-between mt-1">
                        {errors.message ? (
                          <p id="message-error" className="text-xs text-red-400 flex items-center gap-1">
                            <XCircle className="w-3 h-3 flex-shrink-0" />{errors.message}
                          </p>
                        ) : (
                          <span />
                        )}
                        <span className={`text-xs ml-auto ${form.message.length < 20 && form.message.length > 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {form.message.length}/20 min
                        </span>
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 bg-primary text-white font-medium rounded-lg flex items-center justify-center space-x-2 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(79,140,255,0.4)] transition-all interactive disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Send Message</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
