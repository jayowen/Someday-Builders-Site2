# HOLD. Do not publish. See MICHAEL-GATES.md.

# Someday Builders: Launch Checklist

Gates that MUST be closed before this page goes live. Each maps to a marked
spot in `index.html`.

## 1. Form endpoint (blocking)
- [ ] Create a Formspree form (https://formspree.io) OR a Cloudflare Worker
      that accepts POST JSON.
- [ ] Paste the URL into `FORM_ENDPOINT` at the top of the `<script>` block
      in `index.html`. Full wiring instructions live in the comment above
      that constant.
- [ ] Submit a test story and confirm it arrives (email or Worker storage).
- Until this is wired, submissions only go to the visitor's localStorage
  (`somedayStories` key) and the console. No one receives them.

## 2. Analytics (blocking)
- [ ] Paste the GA4 or Plausible snippet into the
      `<!-- analytics: paste GA4 or Plausible snippet here -->` block
      before `</head>`.

## 3. Social links (blocking)
- [ ] Add the real Instagram URL and Substack URL in the footer `<nav>`.
      A commented template is in place; links were removed until real URLs
      exist so the page ships with no dead links.

## 4. Domain and og image
- [x] og card built: `assets/og-card.png` (1200x630) exists and deploys with
      the site. Source file is `assets/og-card.html`; re-export at 1200x630
      if the lockup ever changes.
- [ ] Confirm the live domain (currently assumed somedaybuilders.com) and
      that the absolute `og:image` URL in `<head>` matches it.
- [ ] Confirm `mailto:hello@somedaybuilders.com` is a real, monitored inbox.

## 5. Copy sign-off (recommended before launch)
- [ ] Client sign-off on functional microcopy that is not client-sourced:
      step legends ("Tell us about your marriage"), error lines, and the
      "You're on the list." note.

**Next:** Michael creates the Formspree form and sends the endpoint URL plus real Instagram/Substack links so BB can wire items 1 and 3.
