/**
 * AI Chatbot Widget - Admin Script
 *
 * Initializes the color picker and updates the live preview
 * when settings change on the plugin admin page.
 *
 * @package AI_Chatbot_Widget
 * @since   1.0.0
 */

/* global jQuery, aicwAdmin */
(function ($) {
	'use strict';

	/**
	 * Update the preview button's background color.
	 *
	 * @param {string} color Hex color value.
	 */
	function updatePreviewColor(color) {
		var $button = $('#aicw-preview-button');
		if ($button.length && color) {
			$button.css('background-color', color);
		}
	}

	/**
	 * Update the preview button's position.
	 *
	 * @param {string} position Either 'bottom-right' or 'bottom-left'.
	 */
	function updatePreviewPosition(position) {
		var $button = $('#aicw-preview-button');
		if (!$button.length) {
			return;
		}

		$button.attr('data-position', position);

		// Reset both sides, then apply the correct one.
		if (position === 'bottom-left') {
			$button.css({ right: 'auto', left: '16px' });
		} else {
			$button.css({ left: 'auto', right: '16px' });
		}
	}

	/**
	 * Initialize all interactive elements once the DOM is ready.
	 */
	$(document).ready(function () {
		// Initialize the WordPress color picker.
		$('.aicw-color-picker').wpColorPicker({
			change: function (event, ui) {
				updatePreviewColor(ui.color.toString());
			},
			clear: function () {
				updatePreviewColor(aicwAdmin.defaultColor);
			}
		});

		// Listen for position dropdown changes.
		$('#aicw_position').on('change', function () {
			updatePreviewPosition($(this).val());
		});

		// Set initial preview state from current values.
		var initialColor = $('#aicw_primary_color').val() || aicwAdmin.defaultColor;
		var initialPosition = $('#aicw_position').val() || 'bottom-right';

		updatePreviewColor(initialColor);
		updatePreviewPosition(initialPosition);
	});
})(jQuery);
