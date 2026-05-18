Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Ottieni il percorso della cartella corrente
currentPath = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = currentPath

' ===== STEP 1: Avvia MySQL (nascosto) =====
Dim xamppPath
xamppPath = "C:\xampp"
If Not fso.FolderExists(xamppPath & "\mysql") Then
    xamppPath = "C:\Program Files\XAMPP"
End If
If Not fso.FolderExists(xamppPath & "\mysql") Then
    xamppPath = "D:\xampp"
End If

' Controlla se MySQL è già attivo
Dim mysqlRunning
mysqlRunning = False
Set objWMI = GetObject("winmgmts:\\.\root\cimv2")
Set processes = objWMI.ExecQuery("SELECT * FROM Win32_Process WHERE Name = 'mysqld.exe'")
If processes.Count > 0 Then
    mysqlRunning = True
End If

' Avvia MySQL se non è attivo
If Not mysqlRunning Then
    WshShell.Run xamppPath & "\mysql_start.bat", 0, False
    WScript.Sleep 5000
End If

' ===== STEP 2: Avvia Apache (nascosto) =====
Dim apacheRunning
apacheRunning = False
Set processes = objWMI.ExecQuery("SELECT * FROM Win32_Process WHERE Name = 'httpd.exe'")
If processes.Count > 0 Then
    apacheRunning = True
End If

If Not apacheRunning Then
    WshShell.Run xamppPath & "\apache_start.bat", 0, False
    WScript.Sleep 3000
End If

' ===== STEP 3: Avvia server Node.js (nascosto) =====
WshShell.CurrentDirectory = currentPath & "\backend"
WshShell.Run "cmd /c start /min node server.js", 0, False
WScript.Sleep 4000

' ===== STEP 4: Apri browser =====
WshShell.Run "http://localhost:3000", 1, False

' Mostra un messaggio discreto
MsgBox "Quaderno di Campo avviato con successo!" & vbCrLf & vbCrLf & _
       "L'applicazione è disponibile nel browser.", _
       vbInformation, "✓ Avvio Completato"
