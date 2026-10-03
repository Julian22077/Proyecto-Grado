import { auth} from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const containerPlaca=document.getElementById("placacontenido")
onAuthStateChanged(auth, async (user)=>{
    const token= await user.getIdToken();
containerPlaca.addEventListener("submit", async (e)=>{
    e.preventDefault()
    const placa=containerPlaca["PlacaInfo"].value;
    try{
        const comun=await fetch("http://localhost:3000/validarusoComun",{
            method: "POST",
                headers: {
                    "Content-Type": "application/json",
                     "Authorization": `Bearer ${token}`
                }, 
                body: JSON.stringify({placa:placa})
        })
        const data=await comun.json();
        if(!comun.ok){
            await Swal.fire({
                title: "Error",
                text: data.error,
                icon: "error"
            })
            return;
        }
        await Swal.fire({
            title: "Exito",
            text: "Se generó la asigancion",
            icon: "success"
        })
         window.location.href="admin.html"
    }catch(error){
        console.log(error);
    }
})
});