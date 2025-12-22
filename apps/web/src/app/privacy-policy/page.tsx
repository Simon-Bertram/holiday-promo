import Link from "next/link";
import { CollapsibleSection } from "@/components/legal/collapsible-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto mt-24 max-w-4xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <CardDescription>
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="mb-4 font-semibold text-2xl">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to holiday-promo (&quot;we,&quot; &quot;our,&quot; or
              &quot;us&quot;). We are committed to protecting your privacy and
              ensuring you have a positive experience on our website and in
              using our services. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our
              service.
            </p>
          </section>

          <Separator />

          <CollapsibleSection title="2. Information We Collect">
            <p className="mb-4 text-muted-foreground leading-relaxed">
              We collect information that you provide directly to us and
              information that is automatically collected when you use our
              service.
            </p>
            <h3 className="mt-6 mb-3 font-semibold text-xl">
              2.1 Information You Provide
            </h3>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>Account Information:</strong> When you create an
                account, we collect your name, email address, and profile image
                (if provided).
              </li>
              <li>
                <strong>Authentication Data:</strong> If you sign in using
                social authentication providers (Facebook, Google), we receive
                and store your account identifier from those providers.
              </li>
              <li>
                <strong>Profile Information:</strong> You may update your
                profile information, including your name and email address.
              </li>
            </ul>
            <h3 className="mt-6 mb-3 font-semibold text-xl">
              2.2 Automatically Collected Information
            </h3>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>Session Data:</strong> We collect session information
                including IP address and user agent (browser/device information)
                for security and authentication purposes.
              </li>
              <li>
                <strong>Usage Data:</strong> We may collect information about
                how you interact with our service, including pages visited and
                features used.
              </li>
              <li>
                <strong>Security Data:</strong> We use Cloudflare Turnstile for
                bot protection, which may collect certain technical information
                to verify legitimate users.
              </li>
            </ul>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="3. How We Use Your Information">
            <p className="mb-4 text-muted-foreground leading-relaxed">
              We use the information we collect for the following purposes:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>To provide, maintain, and improve our services</li>
              <li>To authenticate your identity and manage your account</li>
              <li>
                To communicate with you about your account and our services
              </li>
              <li>To protect against fraud, abuse, and security threats</li>
              <li>
                To comply with legal obligations and enforce our terms of
                service
              </li>
              <li>
                To personalize your experience and provide relevant content
              </li>
            </ul>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="4. Social Authentication">
            <p className="mb-4 text-muted-foreground leading-relaxed">
              We offer social authentication through Facebook and Google. When
              you choose to sign in using these providers:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                We receive basic profile information (name, email, profile
                picture) from the authentication provider
              </li>
              <li>
                We store your account identifier and authentication tokens
                securely
              </li>
              <li>
                We do not post to your social media accounts or access your
                friends list without your explicit permission
              </li>
              <li>
                Your use of social authentication is subject to the privacy
                policies of Facebook and Google
              </li>
            </ul>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="5. Data Sharing and Disclosure">
            <p className="mb-4 text-muted-foreground leading-relaxed">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information only in the following
              circumstances:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>Service Providers:</strong> We may share information
                with third-party service providers who perform services on our
                behalf (e.g., hosting, analytics, email delivery)
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose information
                if required by law or in response to valid legal requests
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger,
                acquisition, or sale of assets, your information may be
                transferred
              </li>
              <li>
                <strong>With Your Consent:</strong> We may share information
                with your explicit consent
              </li>
            </ul>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="6. Data Security">
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. These measures
              include encryption, secure authentication protocols, and regular
              security assessments. However, no method of transmission over the
              Internet or electronic storage is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="7. Your Rights and Choices">
            <p className="mb-4 text-muted-foreground leading-relaxed">
              You have the following rights regarding your personal information:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>Access:</strong> You can access and update your profile
                information at any time through your account settings
              </li>
              <li>
                <strong>Deletion:</strong> You can request deletion of your
                account and associated data at any time
              </li>
              <li>
                <strong>Data Portability:</strong> You can request a copy of
                your personal data in a structured, machine-readable format
              </li>
              <li>
                <strong>Opt-Out:</strong> You can opt out of certain data
                collection practices where applicable
              </li>
            </ul>
            <h3 className="mt-6 mb-3 font-semibold text-xl">
              7.1 Facebook Data Deletion
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              If you signed in using Facebook, you can request deletion of your
              data through Facebook&apos;s data deletion process. When you
              submit a deletion request through Facebook, we will:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                Verify the deletion request using Facebook&apos;s signed request
                mechanism
              </li>
              <li>
                Delete your account and all associated data from our systems
              </li>
              <li>
                Provide Facebook with a confirmation URL where you can check the
                status of your deletion request
              </li>
            </ul>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="8. Data Retention">
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to
              provide our services and fulfill the purposes outlined in this
              Privacy Policy, unless a longer retention period is required or
              permitted by law. When you delete your account, we will delete or
              anonymize your personal information, except where we are required
              to retain it for legal or legitimate business purposes.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="9. Children&apos;s Privacy">
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for children under the age of 13. We
              do not knowingly collect personal information from children under
              13. If you are a parent or guardian and believe your child has
              provided us with personal information, please contact us
              immediately, and we will delete such information from our records.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="10. International Data Transfers">
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries
              other than your country of residence. These countries may have
              data protection laws that differ from those in your country. By
              using our service, you consent to the transfer of your information
              to these countries.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="11. Changes to This Privacy Policy">
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or for other operational, legal, or
              regulatory reasons. We will notify you of any material changes by
              posting the new Privacy Policy on this page and updating the
              &quot;Last updated&quot; date. You are advised to review this
              Privacy Policy periodically for any changes.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="12. Contact Us">
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 rounded-lg bg-muted p-4">
              <Link
                className="text-primary hover:underline"
                href="/contact"
                prefetch
              >
                Contact Us
              </Link>
            </div>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="13. California Privacy Rights">
            <p className="text-muted-foreground leading-relaxed">
              If you are a California resident, you have additional rights under
              the California Consumer Privacy Act (CCPA), including:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                The right to know what personal information we collect, use,
                disclose, and sell
              </li>
              <li>
                The right to delete personal information we have collected from
                you
              </li>
              <li>
                The right to opt-out of the sale of personal information (we do
                not sell personal information)
              </li>
              <li>
                The right to non-discrimination for exercising your privacy
                rights
              </li>
            </ul>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="14. GDPR Rights (European Users)">
            <p className="text-muted-foreground leading-relaxed">
              If you are located in the European Economic Area (EEA), you have
              certain data protection rights under the General Data Protection
              Regulation (GDPR), including:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>The right to access your personal data</li>
              <li>The right to rectification of inaccurate data</li>
              <li>The right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>The right to restrict processing</li>
              <li>The right to data portability</li>
              <li>The right to object to processing</li>
              <li>The right to withdraw consent at any time</li>
            </ul>
          </CollapsibleSection>
        </CardContent>
      </Card>
    </div>
  );
}
