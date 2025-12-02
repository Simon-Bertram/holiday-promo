import { ContactForm } from "@/components/contact/contact-form";

export default function ContactPage() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-16">
      <header className="space-y-2">
        <h1 className="font-bold text-3xl">Contact Us</h1>
        <p className="text-muted-foreground">
          Have a question or feedback? We&apos;d love to hear from you. Fill out
          the form below and we&apos;ll get back to you as soon as possible.
        </p>
      </header>

      <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <ContactForm />
      </article>
    </section>
  );
}
