<?php
/**
 * Uninstall handler for AI Chatbot Widget.
 *
 * Removes all plugin options from the database when the plugin
 * is deleted through the WordPress admin interface.
 *
 * @package AI_Chatbot_Widget
 * @since   1.0.0
 */

// Prevent direct access — only run during a proper WordPress uninstall.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// List of all option keys created by the plugin.
$aicw_options = array(
	'aicw_chatbot_id',
	'aicw_api_url',
	'aicw_widget_cdn_url',
	'aicw_enable_all',
	'aicw_exclude_pages',
	'aicw_custom_css',
	'aicw_position',
	'aicw_primary_color',
);

foreach ( $aicw_options as $option ) {
	delete_option( $option );
}

// If multisite, clean up options across all sites.
if ( is_multisite() ) {
	$sites = get_sites( array(
		'fields' => 'ids',
		'number' => 0,
	) );

	foreach ( $sites as $site_id ) {
		switch_to_blog( $site_id );

		foreach ( $aicw_options as $option ) {
			delete_option( $option );
		}

		restore_current_blog();
	}
}
