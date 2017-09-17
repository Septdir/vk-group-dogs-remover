<?php
/**
 *  * @package    VK - Group dogs remover
 *  * @version    1.0.0
 *  * @author     Igor Berdicheskiy - septdir.ru
 *  * @copyright  Copyright (c) 2013 - 2017 Igor Berdicheskiy. All rights reserved.
 *  * @license    GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 *  * @link       https://septdir.ru
 */

ini_set('display_errors', 1);
ini_set('error_reporting', 2047);
ini_set('max_execution_time', 0);

class vkApi
{
	protected function send($method = '', $params = array())
	{
		$response                    = new stdClass();
		$response->error             = 'error';
		$response->error_description = 'curl_error';

		if (!empty($method) && count($params) > 0)
		{
			$query = array();
			foreach ($params as $param)
			{
				$query[$param['name']] = $param['value'];
			}

			$url = 'https://api.vk.com/method/' . $method . '?' . http_build_query($query);

			if (function_exists('curl_init'))
			{
				unset($response->error);
				unset($response->error_description);
				$param = parse_url($url);
				if ($curl = curl_init())
				{
					curl_setopt($curl, CURLOPT_URL, $param['scheme'] . '://' . $param['host'] . $param['path']);
					curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
					curl_setopt($curl, CURLOPT_POST, true);
					curl_setopt($curl, CURLOPT_POSTFIELDS, $param['query']);
					curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
					$response = curl_exec($curl);
					curl_close($curl);
					$response = json_decode($response);

				}
			}
		}

		return $response;
	}

	public function getMembers($params)
	{
		$method = 'groups.getMembers';
		$api    = $this->send($method, $params);

		$users        = new stdClass();
		if (!empty( $api->error)) {
			$users->error = $api->error;
			return $users;
		}
		$users->total = $api->response->count;
		$users->count = count($api->response->users);
		$users->array = $api->response->users;

		return $users;
	}

	public function getDogs($users)
	{
		$dogs = array();
		foreach ($users as $user)
		{
			if (!empty($user->deactivated))
			{
				$dogs[$user->uid] = $user;
			}

		}

		return $dogs;
	}

	public function getMembersHTML($users)
	{
		$html = '';
		foreach ($users as $user)
		{
			$dogsdata = '';
			if (!empty($user->deactivated))
			{
				$dogsdata = ' data-dog="' . $user->uid . '"';
			}
			$name = $user->first_name . ' ' . $user->last_name;
			$html .= '<div id="' . $user->uid . '" class="uk-width-1-6@m"' . $dogsdata . ' >';
			$html .= '<div class="uk-card uk-card-default uk-text-center uk-height-1-1">';
			$html .= '<div class="">';
			$html .= '<img src="' . $user->photo_max . '" alt="' . $name . '" class="uk-width-1-1" />';
			$html .= '</div>';
			$html .= '<h3 class="uk-h5 uk-margin-remove uk-text-truncate uk-padding-small">' . $name . '</h3>';
			$html .= '</div>';
			$html .= '</div>';
		}

		return $html;
	}

	public function removeUser($params)
	{
		$method = 'groups.removeUser';
		$this->send($method, $params);

		return true;
	}
}


$data   = $_POST;
$params = $data['params'];
$task   = $data['task'];
$api    = new vkApi();
if ($task == 'getMembers')
{
	$users = $api->getMembers($params);
	if (!empty($users->error)) {
		echo print_r($users->error, true);
		exit();
	}
	$dogs  = $api->getDogs($users->array);
	$html  = $api->getMembersHTML($users->array);

	$response        = new stdClass();
	$response->total = $users->total;
	$response->count = $users->count;
	$response->dogs  = count($dogs);
	$response->html  = $html;
	$response        = json_encode($response);
	echo $response;
}
if ($task == 'removeUser')
{
	$response = $api->removeUser($params);
	echo json_encode($response);

}