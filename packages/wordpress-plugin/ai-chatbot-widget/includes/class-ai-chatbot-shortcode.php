<?php
/**
 * Shortcode support for AI Chatbot Widget.
 *
 * @package AI_Chatbot_Widget
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class AICW_Shortcode
 *
 * Registers the [ai_chatbot] shortcode, allowing users to embed
 * a specific chatbot instance on individual pages or posts.
 *
 * @since 1.0.0
 */
class AICW_Shortcode {

	/**
	 * Constructor. Register the shortcode.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_shortcode( 'ai_chatbot', array( $this, 'render_shortcode' ) );
	}

	/**
	 * Render the [ai_chatbot] shortcode.
	 *
	 * Accepted attributes:
	 *   - id       : Chatbot ID (overrides the global setting).
	 *   - position : Widget position ('bottom-right' or 'bottom-left').
	 *   - color    : Primary accent color (hex).
	 *
	 * @since 1.0.0
	 *
	 * @param array|string $atts Shortcode attributes.
	 * @return string HTML output for the shortcode.
	 */
	public function render_shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'id'       => get_option( 'aicw_chatbot_id', '' ),
				'position' => get_option( 'aicw_position', 'bottom-right' ),
				'color'    => get_option( 'aicw_primary_color', '#0073aa' ),
			),
			$atts,
			'ai_chatbot'
		);

		// Sanitize all attributes.
		$chatbot_id = sanitize_text_field( $atts['id'] );
		$position   = in_array( $atts['position'], array( 'bottom-right', 'bottom-left' ), true )
			? $atts['position']
			: 'bottom-right';
		$color      = sanitize_hex_color( $atts['color'] );

		if ( empty( $color ) ) {
			$color = '#0073aa';
		}

		// Do not render if no chatbot ID is available.
		if ( empty( $chatbot_id ) ) {
			return '<!-- AI Chatbot Widget: No chatbot ID configured. -->';
		}

		// Ensure the widget script is enqueued when a shortcode is used.
		$cdn_url = get_option( 'aicw_widget_cdn_url', '' );
		$api_url = get_option( 'aicw_api_url', '' );

		if ( ! empty( $cdn_url ) && ! wp_script_is( 'aicw-widget', 'enqueued' ) ) {
			wp_enqueue_script(
				'aicw-widget',
				esc_url( $cdn_url ),
				array(),
				AICW_VERSION,
				true
			);
		}

		// Build a per-instance config object for this shortcode.
		$config = array(
			'chatbotId' => $chatbot_id,
			'position'  => $position,
		);

		if ( ! empty( $api_url ) ) {
			$config['apiUrl'] = esc_url_raw( $api_url );
		}

		if ( ! empty( $color ) ) {
			$config['primaryColor'] = $color;
		}

		// Generate a unique container ID.
		$container_id = 'aicw-' . esc_attr( substr( md5( $chatbot_id . wp_rand() ), 0, 8 ) );

		// Build the container div with data attributes.
		$output  = sprintf(
			'<div id="%s" class="aicw-chatbot-container" data-chatbot-id="%s" data-position="%s" data-color="%s" aria-label="%s"></div>',
			esc_attr( $container_id ),
			esc_attr( $chatbot_id ),
			esc_attr( $position ),
			esc_attr( $color ),
			esc_attr__( 'AI Chatbot Widget', 'ai-chatbot-widget' )
		);

		// Add inline script to initialize this specific instance.
		$inline_js = sprintf(
			'(function(){if(window.AIChatbot&&typeof window.AIChatbot.init==="function"){window.AIChatbot.init(%s);}else{window.AIChatbotConfig=%s;}})();',
			wp_json_encode( $config ),
			wp_json_encode( $config )
		);

		// Use wp_add_inline_script if the widget script is enqueued; otherwise output directly.
		if ( wp_script_is( 'aicw-widget', 'enqueued' ) || wp_script_is( 'aicw-widget', 'registered' ) ) {
			wp_add_inline_script( 'aicw-widget', $inline_js, 'after' );
		}

		return $output;
	}
}
