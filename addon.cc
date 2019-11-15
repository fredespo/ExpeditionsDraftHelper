#include <node.h>
#include <iostream>
#include <windows.h>
#include <string>
#include <fstream>

using namespace v8;
using namespace std;
using std::string;

string GetActiveWindowTitle()
{
 char wnd_title[256];
 HWND hwnd=GetForegroundWindow(); // get handle of currently active window
 GetWindowText(hwnd,wnd_title,sizeof(wnd_title));
 return wnd_title;
}

void GetTopWindow(const FunctionCallbackInfo<Value>& args) {
   ofstream myfile;
   myfile.open ("topWindow.txt");
   myfile << GetActiveWindowTitle();
   myfile.close();
}

void Initialize(Local<Object> exports) {
   NODE_SET_METHOD(exports, "gettopwindow", GetTopWindow);
}

NODE_MODULE(addon, Initialize);