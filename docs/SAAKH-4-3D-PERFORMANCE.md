# Saakh 4.0 3D and performance

The existing lazy R3F/Three/Drei scene is reused, not replaced by imagery. Business nodes come from the active business and related parties; edges come from posted documents. Invoice totals and actual payment records drive connection values. Selecting nodes/documents updates supporting record totals and links. Customer/Supplier presets filter actual source relationships; Cash Flow shows both, while Risk & Scenario links to the explicit scenario analysis. It does not invent fraud scores.

The 2D record/network view remains usable without WebGL. Preferred presentation is a personal setting; 3D retains orbit, zoom, node/edge selection, reset, pause, fullscreen and keyboard inspection from the original component. Desktop uses a resizable split view; mobile stacks the source panel.

Automatic quality uses actual hardwareConcurrency and viewport width to cap pixel density (1 on constrained/mobile, otherwise up to 1.5). Performance forces 1; Visual Quality allows the higher cap. IntersectionObserver pauses off-screen scene updates. Device or manually reduced motion overrides visual quality and prevents animation resume. These are capability heuristics, not a measured adaptive-FPS controller. Graphics quality does not alter graph values or financial results.

No FPS or universal device performance claim is made. Build sizes, local browser render timings and executed browser coverage appear in the final test evidence. The established large lazy WebGL chunk advisory remains disclosed.
