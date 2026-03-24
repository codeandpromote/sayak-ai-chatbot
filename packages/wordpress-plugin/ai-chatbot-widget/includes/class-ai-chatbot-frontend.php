<?php
/**
 * Frontend script injection for AI Chatbot Widget.
 *
 * @package AI_Chatbot_Widget
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class AICW_Frontend
 *
 * Handles injecting the chatbot widget script and configuration
 * on the public-facing side of the site.
 *
 * @since 1.0.0
 */
class AICW_Frontend {

	/**
	 * Constructor. Hook into WordPress frontend.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_widget' ) );
		add_filter( 'script_loader_tag', array( $this, 'add_async_attribute' ), 10, 2 );
	}

	/**
	 * Determine whether the widget should load on the current page.
	 *
	 * @since 1.0.0
	 *
	 * @return bool True if the widget should load, false otherwise.
	 */
	private function should_load_widget() {
		// Never load in admin, on the login page, during AJAX, or on REST API requests.
		if ( is_admin() ) {
			return false;
		}

		if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			return false;
		}

		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return false;
		}

		// Check for login page.
		if ( function_exists( 'is_login' ) && is_login() ) {
			return false;
		}

		// Fallback login page detection for older WordPress versions.
		if ( isset( $GLOBALS['pagenow'] ) && 'wp-login.php' === $GLOBALS['pagenow'] ) {
			return false;
		}

		// A chatbot ID is required.
		$chatbot_id = get_option( 'aicw_chatbot_id', '' );
		if ( empty( $chatbot_id ) ) {
			return false;
		}

		// A CDN URL is required to load the widget script.
		$cdn_url = get_option( 'aicw_widget_cdn_url', '' );
		if ( empty( $cdn_url ) ) {
			return false;
		}

		// Check the "Enable on All Pages" setting.
		$enable_all = get_option( 'aicw_enable_all', '1' );
		if ( '1' !== $enable_all ) {
			return false;
		}

		// Check if the current page/post is in the exclude list.
		$exclude_pages = get_option( 'aicw_exclude_pages', '' );
		if ( ! empty( $exclude_pages ) ) {
			$excluded_ids = array_map( 'absint', array_map( 'trim', explode( ',', $exclude_pages ) ) );
			$current_id   = get_queried_object_id();

			if ( $current_id && in_array( $current_id, $excluded_ids, true ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Enqueue the chatbot widget script and inline configuration on the frontend.
	 *
	 * @since 1.0.0
	 */
	public function enqueue_widget() {
		if ( ! $this->should_load_widget() ) {
			return;
		}

		$cdn_url       = get_option( 'aicw_widget_cdn_url', '' );
		$chatbot_id    = get_option( 'aicw_chatbot_id', '' );
		$api_url       = get_option( 'aicw_api_url', '' );
		$position      = get_option( 'aicw_position', 'bottom-right' );
		$primary_color = get_option( 'aicw_primary_color', '#0073aa' );
		$custom_css    = get_option( 'aicw_custom_css', '' );

		// Register and enqueue the external widget script.
		wp_enqueue_script(
			'aicw-widget',
			esc_url( $cdn_url ),
			array(),
			AICW_VERSION,
			true
		);

		// Build the configuration object.
		$config = array(
			'chatbotId' => sanitize_text_field( $chatbot_id ),
			'position'  => sanitize_text_field( $position ),
		);

		if ( ! empty( $api_url ) ) {
			$config['apiUrl'] = esc_url_raw( $api_url );
		}

		if ( ! empty( $primary_color ) ) {
			$config['primaryColor'] = sanitize_hex_color( $primary_color );
		}

		// Create the inline config script.
		$inline_script = sprintf(
			'window.AIChatbotConfig = %s;',
			wp_json_encode( $config )
		);

		wp_add_inline_script( 'aicw-widget', $inline_script, 'before' );

		// Inject custom CSS if provided.
		if ( ! empty( $custom_css ) ) {
			wp_add_inline_style( 'wp-block-library', wp_strip_all_tags( $custom_css ) );
		}
	}

	/**
	 * Add the async attribute to the widget script tag.
	 *
	 * @since 1.0.0
	 *
	 * @param string $tag    The full script HTML tag.
	 * @param string $handle The script handle.
	 * @return string Modified script tag with async attribute.
	 */
	public function add_async_attribute( $tag, $handle ) {
		if ( 'aicw-widget' !== $handle ) {
			return $tag;
		}

		// Avoid adding duplicate async attribute.
		if ( strpos( $tag, ' async' ) !== false ) {
			return $tag;
		}

		$tag = str_replace( ' src=', ' async src=', $tag );
		return $tag;
	}
}
