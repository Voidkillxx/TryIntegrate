<?php

namespace App\Http\Controllers;

use App\Models\Otp;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log; 
use Carbon\Carbon;
use App\Models\User;

class OtpController extends Controller
{
    // --- 1. PUBLIC: PRE-CHECK OTP (For Forgot Password) ---
    public function checkOtpPublic(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|digits:6'
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) return response()->json(['message' => 'User not found'], 404);

        $otpRecord = Otp::where('user_id', $user->id)->first();

        if (!$otpRecord || $otpRecord->code != $request->code) {
            return response()->json(['message' => 'Invalid OTP Code'], 400);
        }

        if ($otpRecord->isExpired()) {
            return response()->json(['message' => 'OTP Expired'], 400);
        }

        // Success: Code is valid. Frontend can now show the Password Reset form.
        return response()->json(['message' => 'OTP Verified']);
    }

    // --- 2. LOGGED IN: PRE-CHECK OTP (For Profile Changes) ---
    public function checkOtp(Request $request)
    {
        $request->validate(['code' => 'required|digits:6']);
        $user = $request->user();

        $otpRecord = Otp::where('user_id', $user->id)->first();

        if (!$otpRecord || $otpRecord->code != $request->code) {
            return response()->json(['message' => 'Invalid OTP Code'], 400);
        }

        if ($otpRecord->isExpired()) {
            return response()->json(['message' => 'OTP Expired'], 400);
        }

        return response()->json(['message' => 'OTP Verified']);
    }

    public function sendOtpApi(User $user)
    {
        $this->generateAndSend($user);
    }

    public function sendOtpAuthenticated(Request $request)
    {
        $user = $request->user();
        $this->generateAndSend($user);
        return response()->json(['message' => 'OTP sent to your email.']);
    }

    private function generateAndSend(User $user) 
    {
        $code = rand(100000, 999999);
        $names = explode(' ', $user->first_name);
        $firstName = $names[0] ?? 'User';

        $intro = "Hi {$firstName},\nUse the code below to complete your verification process.";
        $outro = "Thanks,\nThe Jake Store Team";

        Otp::where('user_id', $user->id)->delete();
        Otp::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(5)
        ]);

        try {
            Mail::to($user->email)->send(new OtpMail($code, $intro, $outro));
        } catch (\Exception $e) {
            Log::error("Failed to send OTP: " . $e->getMessage());
        }
    }

    public function verifyOtpApi(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|digits:6'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) return response()->json(['message' => 'User not found'], 404);

        $otpRecord = Otp::where('user_id', $user->id)->first();

        if (!$otpRecord || $otpRecord->code != $request->code) {
            return response()->json(['message' => 'Invalid Code'], 400);
        }

        if ($otpRecord->isExpired()) {
            return response()->json(['message' => 'Code Expired'], 400);
        }

        $otpRecord->delete();

        if (!$user->email_verified_at) {
            $user->email_verified_at = now();
            $user->save();
        }

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'message' => 'Login Successful',
            'token' => $token,
            'user' => $user
        ], 200);
    }
}