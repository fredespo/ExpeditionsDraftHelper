#include <node.h>
#include <iostream>
#include <windows.h>
#include <string>
#include <fstream>

using namespace v8;
using namespace std;
using std::string;

HWND GetActiveWindow()
{
 return GetForegroundWindow(); // get handle of currently active window
}

void GetTopWindow(const FunctionCallbackInfo<Value>& args) {
   ofstream myfile;
   HWND activeWindow = GetActiveWindow();
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

   myfile.open ("topWindow.txt");
   myfile << wnd_title << endl;
   myfile << x << endl;
   myfile << y << endl;
   myfile << width << endl;
   myfile << height << endl;
   myfile.close();
}

void Initialize(Local<Object> exports) {
   NODE_SET_METHOD(exports, "gettopwindow", GetTopWindow);
}

NODE_MODULE(addon, Initialize);