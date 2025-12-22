import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CollapsibleSection } from "@/components/legal/collapsible-section";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto mt-24 max-w-4xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
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
            <h2 className="mb-4 font-semibold text-2xl">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using holiday-promo (&quot;we,&quot;
              &quot;our,&quot; or &quot;us&quot;), you agree to be bound by
              these Terms of Service and all applicable laws and regulations. If
              you do not agree with any of these terms, you are prohibited from
              using or accessing this service.
            </p>
          </section>

          <Separator />

          <CollapsibleSection title="2. Account Registration">
            <p className="mb-4 text-muted-foreground leading-relaxed">
              To access certain features of our service, you must create an
              account. When creating an account, you agree to:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                Provide accurate, current, and complete information during
                registration
              </li>
              <li>
                Maintain and promptly update your account information to keep it
                accurate
              </li>
              <li>
                Maintain the security of your password and account credentials
              </li>
              <li>
                Accept responsibility for all activities that occur under your
                account
              </li>
              <li>
                Notify us immediately of any unauthorized use of your account
              </li>
            </ul>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              You must be at least 13 years old to create an account. We reserve
              the right to suspend or terminate accounts that violate these
              terms or engage in fraudulent, abusive, or illegal activity.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="3. Use of Service">
            <p className="mb-4 text-muted-foreground leading-relaxed">
              Our service provides access to holiday deals and promotional
              offers. You may use our service for personal, non-commercial
              purposes in accordance with these terms. You agree not to:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                Use the service for any illegal purpose or in violation of any
                laws
              </li>
              <li>
                Attempt to gain unauthorized access to our systems or networks
              </li>
              <li>
                Interfere with or disrupt the service or servers connected to
                the service
              </li>
              <li>
                Use automated systems (bots, scrapers) to access the service
                without permission
              </li>
              <li>
                Reproduce, duplicate, copy, or resell any portion of the service
              </li>
              <li>
                Impersonate any person or entity or misrepresent your
                affiliation
              </li>
            </ul>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="4. Deals and Promotions">
            <p className="text-muted-foreground leading-relaxed">
              We provide information about holiday deals and promotional offers
              from third-party providers. We do not guarantee the availability,
              quality, or accuracy of these deals. All deals are subject to the
              terms and conditions set by the respective providers. We are not
              responsible for any transactions between you and third-party
              providers, including but not limited to booking issues, payment
              disputes, or service quality. Always review the terms and
              conditions of any deal or promotion before making a purchase.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="5. Intellectual Property">
            <p className="text-muted-foreground leading-relaxed">
              The service and its original content, features, and functionality
              are owned by us and are protected by international copyright,
              trademark, patent, trade secret, and other intellectual property
              laws. You may not modify, reproduce, distribute, create derivative
              works, publicly display, or in any way exploit any of the content
              available through the service without our express written
              permission.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="6. Disclaimers">
            <p className="mb-4 text-muted-foreground leading-relaxed">
              The service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, either express or
              implied. We disclaim all warranties, including but not limited to:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                Warranties of merchantability, fitness for a particular purpose,
                or non-infringement
              </li>
              <li>
                Warranties that the service will be uninterrupted, secure, or
                error-free
              </li>
              <li>
                Warranties regarding the accuracy, reliability, or availability
                of any deals or promotions
              </li>
            </ul>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="7. Limitation of Liability">
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, we shall not be liable for
              any indirect, incidental, special, consequential, or punitive
              damages, or any loss of profits or revenues, whether incurred
              directly or indirectly, or any loss of data, use, goodwill, or
              other intangible losses resulting from your use of the service.
              Our total liability for any claims arising from or related to the
              service shall not exceed the amount you paid us, if any, in the
              twelve months preceding the claim.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="8. Termination">
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the service
              immediately, without prior notice or liability, for any reason,
              including if you breach these Terms of Service. Upon termination,
              your right to use the service will cease immediately. You may also
              terminate your account at any time by deleting it through your
              account settings or by contacting us.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="9. Changes to Terms">
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms of Service
              at any time. If a revision is material, we will provide at least
              30 days notice prior to any new terms taking effect. What
              constitutes a material change will be determined at our sole
              discretion. By continuing to access or use our service after those
              revisions become effective, you agree to be bound by the revised
              terms.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="10. Governing Law">
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service shall be governed by and construed in
              accordance with applicable laws, without regard to its conflict of
              law provisions. Any disputes arising from these terms or your use
              of the service shall be resolved in the appropriate courts of
              jurisdiction.
            </p>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection title="11. Contact Us">
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us:
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
        </CardContent>
      </Card>
    </div>
  );
}
