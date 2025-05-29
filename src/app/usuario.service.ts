import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {  
 // private baseURL = "http://localhost:8080/api/v1/usuarios";  

 // constructor(private httpClient: HttpClient) { }

 // login(celular: string, contrasena: string): Observable<Object> {
   // const credenciales = { email, contrasena };
   // return this.httpClient.post(`${this.baseURL}/login`, credenciales);
 // }


  //registrar(celular: string,contrasena:string,email:string): Observable<Object>{
    //const credenciales = {email, contrasena, edad};
    //return this.httpClient.post(`${this.baseURL}/registrar`, credenciales)
  //}
  
}
