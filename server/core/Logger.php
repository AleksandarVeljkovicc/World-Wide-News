<?php

declare(strict_types=1);

namespace Core;

class Logger
{
    private const LOGS_DIR = __DIR__ . '/../../logs/';

    public static function logInput(string $page, array $input, ?string $ip = null): void
    {
        if (empty($input)) {
            return;
        }

        $date = date('Y-m-d');
        $time = date('H:i');
        $ip = $ip ?? self::getClientIp();
        $logFile = self::LOGS_DIR . $date . '.log';

        if (!is_dir(self::LOGS_DIR)) {
            mkdir(self::LOGS_DIR, 0755, true);
        }

        $logEntry = sprintf(
            "[%s] Page: %s | IP: %s | Input: %s\n",
            $time,
            $page,
            $ip,
            json_encode($input, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );

        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }

    private static function getClientIp(): string
    {
        $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = explode(',', $ip)[0];
                }
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
        
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        if ($ip === 'unknown' || !filter_var($ip, FILTER_VALIDATE_IP)) {
            return 'unknown';
        }
        return $ip;
    }
}
