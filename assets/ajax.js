/*
 * @package    VK - Group dogs remover
 * @version    1.0.2
 * @author     Igor Berdicheskiy - septdir.ru
 * @copyright  Copyright (c) 2013 - 2018 Igor Berdicheskiy. All rights reserved.
 * @license    GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 * @link       https://septdir.ru
 */

$(document).ready(function () {
	$('#form').on('submit', function () {
		$('#result').html('');
		$('#form').find('input[name="offset"]').val(0);
		$('#progressbar').attr('value', '0').attr('max', '10000');
		$(counter).find('.dogs').html('0');
		getMembers();
		return false;
	});

	function removeDogs() {
		var form = $('#form');
		var button = $(form).find('button');
		var progressbar = $('#progressbar');
		var counter = $('#counter');
		var task = 'removeUser';
		var dogs = $('#result').find('[data-dog]');
		var dogsTotal = $(counter).find('.dogs').text() * 1;
		$(progressbar).attr('max', dogsTotal);

		if (dogs.length > 0) {
			var dog = dogs[0];
			var id = $(dog).data('dog');
			var params = $(form).serializeArray();
			params.push({'name': 'user_id', 'value': id});

			$.ajax({
				type: 'POST',
				dataType: 'json',
				url: 'assets/api.php',
				data: {
					'params': params,
					'task': task
				},
				beforeSend: function (response) {
					$(button).attr('disabled', 'disabled');
					$(counter).removeClass('uk-hidden');
					$(progressbar).removeClass('uk-hidden');
					$('#porgresslabel').find('.remove').removeClass('uk-hidden');
				},
				success: function (response) {
					var current = $(counter).find('.remove').text() * 1;
					var total = current + 1;
					$(dog).remove();
					$(counter).find('.remove').text(total);
					$('#progressbar').attr('value', total);
					setTimeout(removeDogs, 1500);

				}
			});

		}
		else {
			$(button).removeAttr('disabled');
			$(progressbar).addClass('uk-hidden');
			$('#progressbar').attr('value', '0').attr('max', '10000');
			$('#porgresslabel').find('.remove').addClass('uk-hidden');
		}

	}

	function getMembers() {
		var form = $('#form');
		var params = $(form).serializeArray();
		var button = $(form).find('button');
		var progressbar = $('#progressbar');
		var counter = $('#counter');
		var task = 'getMembers';
		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: 'assets/api.php',
			data: {
				'params': params,
				'task': task
			},
			beforeSend: function (response) {
				$(button).attr('disabled', 'disabled');
				$(counter).removeClass('uk-hidden');
				$(counter).find('.remove').html('0');
				$(progressbar).removeClass('uk-hidden');
				$('#porgresslabel').find('.members').removeClass('uk-hidden');
			},
			success: function (response) {
				var count = response.count * 1;
				var offsetfiled = $(form).find('input[name="offset"]');
				var offset = $(offsetfiled).val() * 1;
				var newoffset = count + offset;
				var step = $(form).find('input[name="count"]').val() * 1;
				var dogs = $('#counter').find('.dogs').text() * 1;

				$(offsetfiled).val(newoffset);
				$(counter).find('.total').html(newoffset + '/' + response.total);
				$(counter).find('.dogs').html(dogs + (response.dogs * 1));


				var progressMax = $(progressbar).attr('max');
				if (progressMax != response.total) {
					$(progressbar).attr('max', response.total);
				}
				$(progressbar).attr('value', newoffset);


				$(response.html).appendTo($('#result'));

				if (count == step) {
					setTimeout(getMembers, 1500);
				}
				else {
					$(button).removeAttr('disabled');
					$(progressbar).addClass('uk-hidden');
					$('#progressbar').attr('value', '0').attr('max', '10000');
					$('#porgresslabel').find('.members').addClass('uk-hidden');
					if ($(form).find('input[name="remove"]').is(':checked')) {
						removeDogs();
					}
				}
			}
		});
	}

});