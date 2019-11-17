#include <iostream>
#include <windows.h>
#include <string>
#include <fstream>
#include <napi.h>
#include <string>
#include <sstream>

using namespace std;
using std::string;

Napi::String getTopWindowInfoMethod(const Napi::CallbackInfo& info) {
   ofstream myfile;
   HWND activeWindow = GetForegroundWindow();
   char wnd_title[256];
   GetWindowText(activeWindow, wnd_title, sizeof(wnd_title));

   int width;
   int height;
   long x;
   long y;
   RECT rect;
   if(GetWindowRect(activeWindow, &rect))
   {
      x = rect.left;
      y = rect.top;
      width = rect.right - rect.left;
      height = rect.bottom - rect.top;
   }

   std::ostringstream windowInfo;
   string delimiter = ";";
   windowInfo << wnd_title << delimiter;
   windowInfo << x << delimiter;
   windowInfo << y << delimiter;
   windowInfo << width << delimiter;
   windowInfo << height << delimiter;

   Napi::Env env = info.Env();
   return Napi::String::New(env, windowInfo.str());
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "getTopWindowInfo"),
              Napi::Function::New(env, getTopWindowInfoMethod));
  return exports;
}

NODE_API_MODULE(getTopWindowInfo, Init)