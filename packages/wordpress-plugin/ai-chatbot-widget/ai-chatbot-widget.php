<?php
/**
 * Plugin Name:       AI Chatbot Widget
 * Plugin URI:        https://github.com/your-repo/sayak-ai-chatbot
 * Description:       Embed an AI-powered chatbot widget on your WordPress site. Connect to your Sayak AI Chatbot platform for intelligent customer support, lead capture, and appointment booking.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Tested up to:      6.7
 * Requires PHP:      7.4
 * Author:            Sayak AI Chatbot
 * Author URI:        https://github.com/your-repo/sayak-ai-chatbot
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ai-chatbot-widget
 * Domain Path:       /languages
 *
 * @package AI_Chatbot_Widget
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin version constant.
 */
define( 'AICW_VERSION', '1.0.0' );

/**
 * Plugin directory path.
 */
define( 'AICW_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

/**
 * Plugin directory URL.
 */
define( 'AICW_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Plugin basename.
 */
define( 'AICW_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Load plugin textdomain for translations.
 *
 * @since 1.0.0
 */
function aicw_load_textdomain() {
	load_plugin_textdomain(
		'ai-chatbot-widget',
		false,
		dirname( AICW_PLUGIN_BASENAME ) . '/languages'
	);
}
add_action( 'plugins_loaded', 'aicw_load_textdomain' );

// Include required files.
require_once AICW_PLUGIN_DIR . 'includes/class-ai-chatbot-admin.php';
require_once AICW_PLUGIN_DIR . 'includes/class-ai-chatbot-frontend.php';
require_once AICW_PLUGIN_DIR . 'includes/class-ai-chatbot-shortcode.php';

/**
 * Initialize the plugin components.
 *
 * @since 1.0.0
 */
function aicw_init() {
	if ( is_admin() ) {
		new AICW_Admin();
	}

	new AICW_Frontend();
	new AICW_Shortcode();
}
add_action( 'plugins_loaded', 'aicw_init' );

/**
 * Register default options on activation.
 *
 * @since 1.0.0
 */
function aicw_activate() {
	$defaults = array(
		'aicw_chatbot_id'      => '',
		'aicw_api_url'         => '',
		'aicw_widget_cdn_url'  => '',
		'aicw_enable_all'      => '1',
		'aicw_exclude_pages'   => '',
		'aicw_custom_css'      => '',
		'aicw_position'        => 'bottom-right',
		'aicw_primary_color'   => '#0073aa',
	);

	foreach ( $defaults as $option => $value ) {
		if ( false === get_option( $option ) ) {
			add_option( $option, $value );
		}
	}
}
register_activation_hook( __FILE__, 'aicw_activate' );

/**
 * Add a "Settings" link on the Plugins page.
 *
 * @since 1.0.0
 *
 * @param array $links Existing plugin action links.
 * @return array Modified plugin action links.
 */
function aicw_plugin_action_links( $links ) {
	$settings_link = sprintf(
		'<a href="%s">%s</a>',
		esc_url( admin_url( 'options-general.php?page=ai-chatbot-widget' ) ),
		esc_html__( 'Settings', 'ai-chatbot-widget' )
	);
	array_unshift( $links, $settings_link );
	return $links;
}
add_filter( 'plugin_action_links_' . AICW_PLUGIN_BASENAME, 'aicw_plugin_action_links' );
