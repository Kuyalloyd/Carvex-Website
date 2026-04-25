<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your CarVex Password</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;">
                    <tr>
                        <td style="text-align:center;padding-bottom:14px;font-size:22px;font-weight:800;letter-spacing:0.2px;color:#d80000;">
                            CarVex
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#ffffff;border:1px solid #dde4ee;border-radius:14px;padding:30px 26px;box-shadow:0 12px 28px rgba(15,23,42,0.08);">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="font-size:24px;line-height:1.25;font-weight:700;color:#0f172a;padding-bottom:14px;">
                                        Reset your password
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size:15px;line-height:1.7;color:#334155;padding-bottom:12px;">
                                        Hello,
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size:15px;line-height:1.7;color:#334155;padding-bottom:12px;">
                                        We received a request to reset the password for your CarVex account associated with <strong>{{ $email }}</strong>.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size:15px;line-height:1.7;color:#334155;padding-bottom:20px;">
                                        To continue, click the button below and create a new password.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom:20px;">
                                        <a href="{{ $resetLink }}" style="display:inline-block;background:linear-gradient(135deg,#e11d1d,#b70000);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.2px;padding:12px 22px;border-radius:8px;">Reset Password</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size:13px;line-height:1.7;color:#64748b;padding-bottom:12px;">
                                        If the button above does not work, copy and paste this link into your browser:
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size:13px;line-height:1.7;color:#334155;word-break:break-all;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                                        <a href="{{ $resetLink }}" style="color:#0f172a;text-decoration:none;">{{ $resetLink }}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top:18px;font-size:13px;line-height:1.7;color:#64748b;">
                                        If you did not request a password reset, no further action is required.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align:center;padding-top:12px;font-size:12px;line-height:1.6;color:#64748b;">
                            This is an automated security email from CarVex.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
