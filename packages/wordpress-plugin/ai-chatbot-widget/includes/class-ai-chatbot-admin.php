<?php
/**
 * Admin settings page for AI Chatbot Widget.
 *
 * @package AI_Chatbot_Widget
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class AICW_Admin
 *
 * Handles the admin settings page, registering settings, rendering fields,
 * and enqueueing admin-specific assets.
 *
 * @since 1.0.0
 */
class AICW_Admin {

	/**
	 * Option group name used by the Settings API.
	 *
	 * @var string
	 */
	private $option_group = 'aicw_settings_group';

	/**
	 * Settings page slug.
	 *
	 * @var string
	 */
	private $page_slug = 'ai-chatbot-widget';

	/**
	 * Constructor. Hook into WordPress.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
	 * Add the settings page under Settings menu.
	 *
	 * @since 1.0.0
	 */
	public function add_settings_page() {
		add_options_page(
			esc_html__( 'AI Chatbot Widget Settings', 'ai-chatbot-widget' ),
			esc_html__( 'AI Chatbot Widget', 'ai-chatbot-widget' ),
			'manage_options',
			$this->page_slug,
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Register all plugin settings using the Settings API.
	 *
	 * @since 1.0.0
	 */
	public function register_settings() {

		// --- Connection Section ---
		add_settings_section(
			'aicw_section_connection',
			esc_html__( 'Connection Settings', 'ai-chatbot-widget' ),
			array( $this, 'render_section_connection' ),
			$this->page_slug
		);

		// Chatbot ID.
		register_setting( $this->option_group, 'aicw_chatbot_id', array(
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
			'default'           => '',
		) );
		add_settings_field(
			'aicw_chatbot_id',
			esc_html__( 'Chatbot ID', 'ai-chatbot-widget' ),
			array( $this, 'render_field_chatbot_id' ),
			$this->page_slug,
			'aicw_section_connection'
		);

		// API URL.
		register_setting( $this->option_group, 'aicw_api_url', array(
			'type'              => 'string',
			'sanitize_callback' => 'esc_url_raw',
			'default'           => '',
		) );
		add_settings_field(
			'aicw_api_url',
			esc_html__( 'API URL', 'ai-chatbot-widget' ),
			array( $this, 'render_field_api_url' ),
			$this->page_slug,
			'aicw_section_connection'
		);

		// Widget CDN URL.
		register_setting( $this->option_group, 'aicw_widget_cdn_url', array(
			'type'              => 'string',
			'sanitize_callback' => 'esc_url_raw',
			'default'           => '',
		) );
		add_settings_field(
			'aicw_widget_cdn_url',
			esc_html__( 'Widget CDN URL', 'ai-chatbot-widget' ),
			array( $this, 'render_field_widget_cdn_url' ),
			$this->page_slug,
			'aicw_section_connection'
		);

		// --- Display Section ---
		add_settings_section(
			'aicw_section_display',
			esc_html__( 'Display Settings', 'ai-chatbot-widget' ),
			array( $this, 'render_section_display' ),
			$this->page_slug
		);

		// Enable on All Pages.
		register_setting( $this->option_group, 'aicw_enable_all', array(
			'type'              => 'string',
			'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
			'default'           => '1',
		) );
		add_settings_field(
			'aicw_enable_all',
			esc_html__( 'Enable on All Pages', 'ai-chatbot-widget' ),
			array( $this, 'render_field_enable_all' ),
			$this->page_slug,
			'aicw_section_display'
		);

		// Exclude Pages.
		register_setting( $this->option_group, 'aicw_exclude_pages', array(
			'type'              => 'string',
			'sanitize_callback' => array( $this, 'sanitize_exclude_pages' ),
			'default'           => '',
		) );
		add_settings_field(
			'aicw_exclude_pages',
			esc_html__( 'Exclude Pages', 'ai-chatbot-widget' ),
			array( $this, 'render_field_exclude_pages' ),
			$this->page_slug,
			'aicw_section_display'
		);

		// Widget Position.
		register_setting( $this->option_group, 'aicw_position', array(
			'type'              => 'string',
			'sanitize_callback' => array( $this, 'sanitize_position' ),
			'default'           => 'bottom-right',
		) );
		add_settings_field(
			'aicw_position',
			esc_html__( 'Widget Position', 'ai-chatbot-widget' ),
			array( $this, 'render_field_position' ),
			$this->page_slug,
			'aicw_section_display'
		);

		// Primary Color.
		register_setting( $this->option_group, 'aicw_primary_color', array(
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_hex_color',
			'default'           => '#0073aa',
		) );
		add_settings_field(
			'aicw_primary_color',
			esc_html__( 'Primary Color', 'ai-chatbot-widget' ),
			array( $this, 'render_field_primary_color' ),
			$this->page_slug,
			'aicw_section_display'
		);

		// Custom CSS.
		register_setting( $this->option_group, 'aicw_custom_css', array(
			'type'              => 'string',
			'sanitize_callback' => array( $this, 'sanitize_custom_css' ),
			'default'           => '',
		) );
		add_settings_field(
			'aicw_custom_css',
			esc_html__( 'Custom CSS', 'ai-chatbot-widget' ),
			array( $this, 'render_field_custom_css' ),
			$this->page_slug,
			'aicw_section_display'
		);
	}

	/**
	 * Enqueue admin styles and scripts on the plugin settings page only.
	 *
	 * @since 1.0.0
	 *
	 * @param string $hook_suffix The current admin page hook suffix.
	 */
	public function enqueue_admin_assets( $hook_suffix ) {
		if ( 'settings_page_' . $this->page_slug !== $hook_suffix ) {
			return;
		}

		// WordPress color picker.
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_script( 'wp-color-picker' );

		// Plugin admin styles.
		wp_enqueue_style(
			'aicw-admin-style',
			AICW_PLUGIN_URL . 'admin/css/admin-style.css',
			array( 'wp-color-picker' ),
			AICW_VERSION
		);

		// Plugin admin script.
		wp_enqueue_script(
			'aicw-admin-script',
			AICW_PLUGIN_URL . 'admin/js/admin-script.js',
			array( 'jquery', 'wp-color-picker' ),
			AICW_VERSION,
			true
		);

		wp_localize_script( 'aicw-admin-script', 'aicwAdmin', array(
			'defaultColor' => '#0073aa',
		) );
	}

	/**
	 * Render the Connection section description.
	 *
	 * @since 1.0.0
	 */
	public function render_section_connection() {
		echo '<p>' . esc_html__( 'Configure how the widget connects to your Sayak AI Chatbot platform.', 'ai-chatbot-widget' ) . '</p>';
	}

	/**
	 * Render the Display section description.
	 *
	 * @since 1.0.0
	 */
	public function render_section_display() {
		echo '<p>' . esc_html__( 'Customize the appearance and visibility of the chatbot widget.', 'ai-chatbot-widget' ) . '</p>';
	}

	/**
	 * Render the Chatbot ID field.
	 *
	 * @since 1.0.0
	 */
	public function render_field_chatbot_id() {
		$value = get_option( 'aicw_chatbot_id', '' );
		printf(
			'<input type="text" id="aicw_chatbot_id" name="aicw_chatbot_id" value="%s" class="regular-text" placeholder="%s" required />',
			esc_attr( $value ),
			esc_attr__( 'e.g., 550e8400-e29b-41d4-a716-446655440000', 'ai-chatbot-widget' )
		);
		echo '<p class="description">' . esc_html__( 'Your chatbot UUID from the Sayak AI Chatbot platform. This field is required.', 'ai-chatbot-widget' ) . '</p>';
	}

	/**
	 * Render the API URL field.
	 *
	 * @since 1.0.0
	 */
	public function render_field_api_url() {
		$value = get_option( 'aicw_api_url', '' );
		printf(
			'<input type="url" id="aicw_api_url" name="aicw_api_url" value="%s" class="regular-text" placeholder="%s" />',
			esc_attr( $value ),
			esc_attr__( 'https://api.example.com', 'ai-chatbot-widget' )
		);
		echo '<p class="description">' . esc_html__( 'The API server URL for your chatbot platform.', 'ai-chatbot-widget' ) . '</p>';
	}

	/**
	 * Render the Widget CDN URL field.
	 *
	 * @since 1.0.0
	 */
	public function render_field_widget_cdn_url() {
		$value = get_option( 'aicw_widget_cdn_url', '' );
		printf(
			'<input type="url" id="aicw_widget_cdn_url" name="aicw_widget_cdn_url" value="%s" class="regular-text" placeholder="%s" />',
			esc_attr( $value ),
			esc_attr__( 'https://cdn.example.com/widget.js', 'ai-chatbot-widget' )
		);
		echo '<p class="description">' . esc_html__( 'The full URL to the widget JavaScript file hosted on your CDN.', 'ai-chatbot-widget' ) . '</p>';
	}

	/**
	 * Render the Enable on All Pages checkbox field.
	 *
	 * @since 1.0.0
	 */
	public function render_field_enable_all() {
		$value = get_option( 'aicw_enable_all', '1' );
		printf(
			'<label for="aicw_enable_all"><input type="checkbox" id="aicw_enable_all" name="aicw_enable_all" value="1" %s /> %s</label>',
			checked( $value, '1', false ),
			esc_html__( 'Inject the chatbot widget on all frontend pages.', 'ai-chatbot-widget' )
		);
	}

	/**
	 * Render the Exclude Pages field.
	 *
	 * @since 1.0.0
	 */
	public function render_field_exclude_pages() {
		$value = get_option( 'aicw_exclude_pages', '' );
		printf(
			'<input type="text" id="aicw_exclude_pages" name="aicw_exclude_pages" value="%s" class="regular-text" placeholder="%s" />',
			esc_attr( $value ),
			esc_attr__( '42, 85, 123', 'ai-chatbot-widget' )
		);
		echo '<p class="description">' . esc_html__( 'Comma-separated list of page/post IDs where the widget should not appear.', 'ai-chatbot-widget' ) . '</p>';
	}

	/**
	 * Render the Widget Position select field.
	 *
	 * @since 1.0.0
	 */
	public function render_field_position() {
		$value   = get_option( 'aicw_position', 'bottom-right' );
		$options = array(
			'bottom-right' => __( 'Bottom Right', 'ai-chatbot-widget' ),
			'bottom-left'  => __( 'Bottom Left', 'ai-chatbot-widget' ),
		);

		echo '<select id="aicw_position" name="aicw_position">';
		foreach ( $options as $key => $label ) {
			printf(
				'<option value="%s" %s>%s</option>',
				esc_attr( $key ),
				selected( $value, $key, false ),
				esc_html( $label )
			);
		}
		echo '</select>';
		echo '<p class="description">' . esc_html__( 'Where the widget launcher button appears on the page.', 'ai-chatbot-widget' ) . '</p>';
	}

	/**
	 * Render the Primary Color field with a color picker.
	 *
	 * @since 1.0.0
	 */
	public function render_field_primary_color() {
		$value = get_option( 'aicw_primary_color', '#0073aa' );
		printf(
			'<input type="text" id="aicw_primary_color" name="aicw_primary_color" value="%s" class="aicw-color-picker" data-default-color="#0073aa" />',
			esc_attr( $value )
		);
		echo '<p class="description">' . esc_html__( 'The primary accent color for the chatbot widget button and header.', 'ai-chatbot-widget' ) . '</p>';
	}

	/**
	 * Render the Custom CSS textarea field.
	 *
	 * @since 1.0.0
	 */
	public function render_field_custom_css() {
		$value = get_option( 'aicw_custom_css', '' );
		printf(
			'<textarea id="aicw_custom_css" name="aicw_custom_css" rows="6" cols="50" class="large-text code" placeholder="%s">%s</textarea>',
			esc_attr__( '/* Custom styles for the chatbot widget */', 'ai-chatbot-widget' ),
			esc_textarea( $value )
		);
		echo '<p class="description">' . esc_html__( 'Additional CSS to inject on pages where the widget is loaded.', 'ai-chatbot-widget' ) . '</p>';
	}

	/**
	 * Render the main settings page.
	 *
	 * @since 1.0.0
	 */
	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$position      = get_option( 'aicw_position', 'bottom-right' );
		$primary_color = get_option( 'aicw_primary_color', '#0073aa' );
		?>
		<div class="wrap aicw-settings-wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

			<?php settings_errors(); ?>

			<div class="aicw-settings-columns">
				<div class="aicw-settings-main">
					<form method="post" action="options.php">
						<?php
						settings_fields( $this->option_group );
						do_settings_sections( $this->page_slug );
						submit_button( esc_html__( 'Save Settings', 'ai-chatbot-widget' ) );
						?>
					</form>
				</div>

				<div class="aicw-settings-sidebar">
					<div class="aicw-preview-panel">
						<h2><?php esc_html_e( 'Live Preview', 'ai-chatbot-widget' ); ?></h2>
						<p class="description"><?php esc_html_e( 'Preview of the widget launcher button.', 'ai-chatbot-widget' ); ?></p>
						<div class="aicw-preview-container">
							<div
								id="aicw-preview-button"
								class="aicw-preview-button"
								data-position="<?php echo esc_attr( $position ); ?>"
								style="background-color: <?php echo esc_attr( $primary_color ); ?>;"
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
									<path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="#ffffff"/>
									<path d="M7 9H9V11H7V9ZM11 9H13V11H11V9ZM15 9H17V11H15V9Z" fill="#ffffff"/>
								</svg>
							</div>
						</div>
					</div>

					<div class="aicw-info-panel">
						<h2><?php esc_html_e( 'Need Help?', 'ai-chatbot-widget' ); ?></h2>
						<p><?php esc_html_e( 'Use the [ai_chatbot] shortcode to embed a chatbot on specific pages.', 'ai-chatbot-widget' ); ?></p>
						<p>
							<?php
							printf(
								/* translators: %s: shortcode example */
								esc_html__( 'Example: %s', 'ai-chatbot-widget' ),
								'<code>[ai_chatbot id="your-chatbot-id" position="bottom-right" color="#0073aa"]</code>'
							);
							?>
						</p>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Sanitize checkbox value.
	 *
	 * @since 1.0.0
	 *
	 * @param mixed $value The raw checkbox value.
	 * @return string '1' if checked, '0' otherwise.
	 */
	public function sanitize_checkbox( $value ) {
		return '1' === $value ? '1' : '0';
	}

	/**
	 * Sanitize the exclude pages field to a clean comma-separated list of integers.
	 *
	 * @since 1.0.0
	 *
	 * @param string $value Raw comma-separated page IDs.
	 * @return string Sanitized comma-separated page IDs.
	 */
	public function sanitize_exclude_pages( $value ) {
		if ( empty( $value ) ) {
			return '';
		}

		$ids = array_map( 'trim', explode( ',', $value ) );
		$ids = array_filter( $ids, 'is_numeric' );
		$ids = array_map( 'absint', $ids );
		$ids = array_filter( $ids );

		return implode( ', ', $ids );
	}

	/**
	 * Sanitize the position value against the allowed list.
	 *
	 * @since 1.0.0
	 *
	 * @param string $value The raw position value.
	 * @return string A valid position string.
	 */
	public function sanitize_position( $value ) {
		$allowed = array( 'bottom-right', 'bottom-left' );
		return in_array( $value, $allowed, true ) ? $value : 'bottom-right';
	}

	/**
	 * Sanitize custom CSS input. Strips script tags and other dangerous content.
	 *
	 * @since 1.0.0
	 *
	 * @param string $value Raw CSS input.
	 * @return string Sanitized CSS.
	 */
	public function sanitize_custom_css( $value ) {
		// Strip HTML tags entirely; CSS should not contain HTML.
		$value = wp_strip_all_tags( $value );
		return $value;
	}
}
