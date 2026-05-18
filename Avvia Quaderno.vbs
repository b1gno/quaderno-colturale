Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Ottieni il percorso della cartella corrente
currentPath = fso.GetParentFolderName(WScript.ScriptFullName)

' Cambia directory e avvia lo script batch senza mostrare la finestra
WshShell.CurrentDirectory = currentPath
WshShell.Run "avvia-tutto.bat", 0, False

' Messaggio opzionale
WScript.Sleep 1000
MsgBox "Quaderno di Campo in avvio..." & vbCrLf & vbCrLf & "Il browser si aprirà automaticamente tra pochi secondi.", vbInformation, "Quaderno di Campo"
