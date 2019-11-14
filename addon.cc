#include <node.h>
#include <iostream>
#include <windows.h>
#include <string>

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
   cout << "Top level window: " << GetActiveWindowTitle() << endl;
}

void Initialize(Local<Object> exports) {
   NODE_SET_METHOD(exports, "gettopwindow", GetTopWindow);
}

NODE_MODULE(addon, Initialize);