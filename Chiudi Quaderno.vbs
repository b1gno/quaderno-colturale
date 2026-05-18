Set WshShell = CreateObject("WScript.Shell")
Set objWMI = GetObject("winmgmts:\\.\root\cimv2")

' Chiedi conferma
risposta = MsgBox("Vuoi chiudere il Quaderno di Campo?" & vbCrLf & vbCrLf & _
                  "Verranno fermati:" & vbCrLf & _
                  "- Server Node.js" & vbCrLf & _
                  "- MySQL" & vbCrLf & _
                  "- Apache", _
                  vbQuestion + vbYesNo, "Chiusura Quaderno di Campo")

If risposta = vbNo Then
    WScript.Quit
End If

' ===== Ferma Node.js =====
Set processes = objWMI.ExecQuery("SELECT * FROM Win32_Process WHERE Name = 'node.exe'")
For Each process In processes
    process.Terminate()
Next

' ===== Ferma MySQL =====
Dim xamppPath
xamppPath = "C:\xampp"
If Not CreateObject("Scripting.FileSystemObject").FolderExists(xamppPath & "\mysql") Then
    xamppPath = "C:\Program Files\XAMPP"
End If

WshShell.Run xamppPath & "\mysql_stop.bat", 0, True
WScript.Sleep 2000

' ===== Ferma Apache =====
WshShell.Run xamppPath & "\apache_stop.bat", 0, True
WScript.Sleep 2000

' Messaggio finale
MsgBox "Quaderno di Campo chiuso correttamente!", vbInformation, "✓ Chiusura Completata"
