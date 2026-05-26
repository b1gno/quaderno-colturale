const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema utente: rappresenta un agricoltore o amministratore del sistema
const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true }, // Email univoca (usata per login)
  password: { type: String, required: true }, // Password hashata con bcrypt
  nome:     { type: String, required: true, trim: true }, // Nome visualizzato dell'utente
  ruolo:    { type: String, enum: ['user', 'admin'], default: 'user' }, // Ruolo: utente normale o admin
  username: { type: String }, // Username opzionale, generato automaticamente dall'email se non fornito
}, { timestamps: true }); // Aggiunge automaticamente createdAt e updatedAt

// Hook "pre save": eseguito prima di salvare un utente nel database
userSchema.pre('save', async function () {
  if (!this.username) this.username = this.email.split('@')[0]; // Genera username dalla parte locale dell'email
  if (!this.isModified('password')) return; // Se la password non è stata modificata, salta l'hashing
  this.password = await bcrypt.hash(this.password, 12); // Hash della password con costo 12
});

// Metodo per confrontare una password in chiaro con l'hash salvato
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Sovrascrive toJSON per non esporre mai la password nelle risposte API
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
