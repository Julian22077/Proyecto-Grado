import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import {
    getMessaging,
    getToken
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging.js";

import { convertirHora} from "./utils.js";
import { getFirestore, collection,  deleteDoc, doc, updateDoc, setDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyC-XuvC-iOS2GXL1mAQ3Zs84g1Pc_xw98E",
    authDomain: "parqueadero-40b7c.firebaseapp.com",
    projectId: "parqueadero-40b7c",
    storageBucket: "parqueadero-40b7c.firebasestorage.app",
    messagingSenderId: "1045474082793",
    appId: "1:1045474082793:web:40d3053035708fded1d578"
};
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const addUsuario = async (nombre, correo, contraseña, cedula, placa) => {
    if(!nombre?.trim() || !correo?.trim() || !contraseña?.trim() || !cedula?.trim() || !placa?.trim()){
        throw new Error("Todos los campos son obligatorios");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, correo, contraseña);
    const user = userCredential.user;
    await updateProfile(user, { displayName: nombre });
    await setDoc(doc(db, "usuarios", user.uid), { nombre, correo, cedula, placa });
};
export const loginUsusario = async (correo, contraseña) => {
    if(!correo?.trim() || !contraseña?.trim()){
        throw new Error("Correo y contraseña son obligatorios");
    }
    await signInWithEmailAndPassword(auth, correo, contraseña);
};
export const logoutUsuario = async () => {
    await signOut(auth);
};
export const updateUsusario = async (uid, newFields) => {
    await updateProfile(auth.currentUser, { displayName: newFields.nombre });
    await updateDoc(doc(db, "usuarios", uid), newFields);
};
export const obtenerEstado = (fecha, horaEntrada, horaSalida, finalizadaAntes) => {
    const ahora = new Date()
    const fechahoy = ahora.toLocaleDateString("sv-SE");
    const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
    const entrada = convertirHora(horaEntrada);
    const salida = convertirHora(horaSalida);
    if (fecha < fechahoy) {
        return "finalizada";
    }
    if (fecha > fechahoy) {
        return "pendiente";
    }
    if (minutosActuales < entrada) {
        return "pendiente"
    }
    if (minutosActuales >= salida) {
        return "finalizada"
    }
    if (finalizadaAntes) {
        return "finalizada"
    }
    return "activa"
}
export const cambiarContraseña = async (contraseñaActual, nuevaContraseña) => {
    const usuario = auth.currentUser;
    const credential = EmailAuthProvider.credential(usuario.email, contraseñaActual);
    await reauthenticateWithCredential(usuario, credential);
    await updatePassword(usuario, nuevaContraseña);
}
export const recuperarContraseña = async (correo) => {
    await sendPasswordResetEmail(auth, correo);
}
export const NotificarUsuario = async (uid, fecha, callback)=>{
    const cola= query(collection(db, "colaespera"),where("fecha","==",fecha),where("uid","==",uid));
    onSnapshot(cola, (snapshot) => {
        snapshot.forEach((doc) => {
           const data = doc.data();
              if(data.estado==="prioritario"){
                callback(data, doc.id);
              }
        });
    });
}
export const cancelarNotificacion = async (colaId, fecha,  parqueaderoId)=>{
    await updateDoc(doc(db, "colaespera", colaId), { estado: "cancelado" });
    await gestionarCola(fecha, parqueaderoId);
    await deleteDoc(doc(db, "colaespera", colaId));
}
export const obtenertokenFCM=async()=>{
    const messagin= getMessaging();
    const permiso = await Notification.requestPermission();
        console.log("Permiso obtenido:", permiso);
     if (permiso !== "granted") {
        console.log("No se concedieron permisos");
        return null;
    }
    if(permiso==="granted"){
     
        const token= await getToken(messagin, { vapidKey: "BG8q0p1LPECiE-QNbCZMKOQNOY_1RZw5NShNsNnsRKJkBw_k5sDAlU6liuzh1_j-em6mU0DHanZOkQ62HQNmdXI"
        })
        console.log(token)
        return token;

    }
}

