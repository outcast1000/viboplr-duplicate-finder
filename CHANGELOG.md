# Changelog

## v1.1.0
- Uses Viboplr's host-drawn view header (app 1.0.77+): the scan summary ("14 duplicate groups · 31 extra copies · 250 MB reclaimable", "Not scanned yet") is the header's subtitle, a status word shows Scanning… / Clean / Scan failed, and Scan library / Rescan is the header's button. The view no longer draws its own "Duplicate Finder" toolbar under it.
- Older app versions are unaffected and keep the toolbar.

## v1.0.0
- Initial release. Externalized from the Viboplr app's built-in plugins (previously bundled as `duplicate-finder`); functionally identical, now installable and updatable from the plugin gallery.
