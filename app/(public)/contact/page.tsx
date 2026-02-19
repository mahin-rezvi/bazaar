import { SITE } from "@/lib/site";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  const q = encodeURIComponent(SITE.location.label);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const mapsEmbed = `https://www.google.com/maps?q=${q}&output=embed`;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="text-sm text-muted-foreground">
          Get in touch for collaboration, feedback, or support.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Owner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="text-base font-semibold">{SITE.owner.fullName}</div>
            <div className="text-muted-foreground">{SITE.owner.title}</div>
            <div className="text-muted-foreground">{SITE.owner.organization}</div>
            <div className="pt-2">
              <span className="text-muted-foreground">Phone: </span>
              <a className="font-medium hover:underline" href={`tel:${SITE.owner.phone}`}>
                {SITE.owner.phone}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{SITE.location.label}</div>
            <a className="inline-flex font-medium text-foreground hover:underline" href={mapsLink} target="_blank" rel="noreferrer">
              Open in Google Maps
            </a>
            <div className="aspect-[16/10] overflow-hidden rounded-xl border bg-muted">
              <iframe
                title="Google Maps"
                src={mapsEmbed}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
