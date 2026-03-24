=== AI Chatbot Widget ===
Contributors: sayakbiswas
Donate link: https://github.com/your-repo/sayak-ai-chatbot
Tags: chatbot, ai, customer-support, live-chat, lead-generation
Requires at least: 5.8
Tested up to: 6.7
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed an AI-powered chatbot widget on your WordPress site for intelligent customer support, lead capture, and appointment booking.

== Description ==

AI Chatbot Widget connects your WordPress site to the Sayak AI Chatbot platform, giving your visitors access to an intelligent, always-available chatbot assistant.

**Key Features:**

* **Easy Setup** — Enter your Chatbot ID and CDN URL, and the widget appears on your site instantly.
* **Global or Selective Deployment** — Enable the widget on all pages or use the `[ai_chatbot]` shortcode to place it on specific pages.
* **Page Exclusions** — Exclude the widget from specific pages by ID.
* **Customizable Appearance** — Choose the widget position (bottom-right or bottom-left) and set a custom primary color to match your brand.
* **Custom CSS** — Add your own CSS to further style the widget.
* **Live Preview** — See how the widget launcher button looks directly in the settings page.
* **Lightweight** — The widget script loads asynchronously so it does not impact your page load speed.
* **Translation Ready** — Fully internationalized with a .pot file included for translation.

**Use Cases:**

* Customer support and FAQ automation
* Lead generation and qualification
* Appointment booking
* Product recommendations
* General website assistance

**Shortcode Usage:**

Use the `[ai_chatbot]` shortcode to embed a chatbot on specific pages or posts:

`[ai_chatbot id="your-chatbot-id" position="bottom-right" color="#0073aa"]`

**Attributes:**

* `id` — Override the global Chatbot ID for this instance.
* `position` — Widget position: `bottom-right` or `bottom-left`.
* `color` — Hex color code for the widget accent color.

== Installation ==

= Automatic Installation =

1. Go to **Plugins > Add New** in your WordPress admin.
2. Search for "AI Chatbot Widget".
3. Click **Install Now** and then **Activate**.
4. Go to **Settings > AI Chatbot Widget** to configure.

= Manual Installation =

1. Download the plugin ZIP file.
2. Go to **Plugins > Add New > Upload Plugin**.
3. Upload the ZIP file and click **Install Now**.
4. Activate the plugin.
5. Go to **Settings > AI Chatbot Widget** to configure.

= Configuration =

1. Obtain your **Chatbot ID** from your Sayak AI Chatbot platform dashboard.
2. Enter the **Widget CDN URL** where your widget.js file is hosted.
3. Optionally set the **API URL** if your platform requires a custom endpoint.
4. Choose your preferred **position** and **primary color**.
5. Click **Save Settings**.

== Frequently Asked Questions ==

= Where do I get a Chatbot ID? =

Sign up at your Sayak AI Chatbot platform and create a new chatbot. The platform will provide you with a unique Chatbot ID (UUID).

= Can I use different chatbots on different pages? =

Yes. Use the `[ai_chatbot]` shortcode with the `id` attribute to specify a different chatbot on any page or post.

= Will this slow down my website? =

No. The widget script is loaded asynchronously, meaning it does not block your page from rendering. It loads in the background after your page content is ready.

= Can I exclude the widget from specific pages? =

Yes. Go to **Settings > AI Chatbot Widget** and enter a comma-separated list of page or post IDs in the **Exclude Pages** field.

= Does this plugin work with caching plugins? =

Yes. The widget loads via JavaScript and is fully compatible with page caching plugins such as WP Super Cache, W3 Total Cache, and WP Rocket.

= Is the plugin translation ready? =

Yes. All strings are internationalized. A .pot file is included in the `languages` folder for translators.

= What happens when I uninstall the plugin? =

All plugin settings are removed from the database. No data is left behind.

== Screenshots ==

1. Settings page — Connection settings for Chatbot ID, API URL, and CDN URL.
2. Settings page — Display options including position, color, and page exclusions.
3. Live preview panel showing the widget launcher button.
4. Frontend — The chatbot widget launcher button on a WordPress site.

== Changelog ==

= 1.0.0 =
* Initial release.
* Settings page with connection and display options.
* Global widget injection with page exclusion support.
* `[ai_chatbot]` shortcode for per-page chatbot embedding.
* Live preview of widget launcher in admin settings.
* WordPress color picker integration for primary color.
* Async script loading for optimal performance.
* Full internationalization support.
* Clean uninstall removes all options from the database.

== Upgrade Notice ==

= 1.0.0 =
Initial release of AI Chatbot Widget.
