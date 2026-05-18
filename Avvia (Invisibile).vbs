Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Ottieni il percorso della cartella corrente
currentPath = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = currentPath

' ===== Trova XAMPP =====
Dim xamppPath
xamppPath = "C:\xampp"
If Not fso.FolderExists(xamppPath & "\mysql") Then
    xamppPath = "C:\Program Files\XAMPP"
End If
If Not fso.FolderExists(xamppPath & "\mysql") Then
    xamppPath = "D:\xampp"
End If

' ===== Controlla e avvia MySQL =====
Set objWMI = GetObject("winmgmts:\\.\root\cimv2")
Set processes = objWMI.ExecQuery("SELECT * FROM Win32_Process WHERE Name = 'mysqld.exe'")
If processes.Count = 0 Then
    WshShell.Run xamppPath & "\mysql_start.bat", 0, False
    WScript.Sleep 5000
End If

' ===== Controlla e avvia Apache =====
Set processes = objWMI.ExecQuery("SELECT * FROM Win32_Process WHERE Name = 'httpd.exe'")
If processes.Count = 0 Then
    WshShell.Run xamppPath & "\apache_start.bat", 0, False
    WScript.Sleep 3000
End If

' ===== Avvia server Node.js completamente nascosto =====
WshShell.CurrentDirectory = currentPath & "\backend"
WshShell.Run "cmd /c start /min node server.js", 0, False
WScript.Sleep 4000

' ===== Apri browser =====
WshShell.Run "http://localhost:3000", 1, False

' NESSUN MESSAGGIO - Completamente silenzioso
