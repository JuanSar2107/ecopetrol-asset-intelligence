#!/usr/bin/env python3
"""
METTAV GROUP SAS - Script de Gestión, Ejecución y Despliegue (run.py)
-------------------------------------------------------------------
Este script permite gestionar el ciclo de vida del proyecto:
  - Iniciar entorno de desarrollo local (Vite)
  - Compilar la aplicación para producción (npm run build)
  - Levantar con Docker Compose (construir y desplegar contenedor Nginx)
  - Detener contenedores Docker
  - Servir la aplicación en producción con servidor local integrado
  - Verificar dependencias y estado del entorno
"""

import sys
import os
import subprocess
import shutil
import argparse
import time
from pathlib import Path

# Definición de colores para terminal
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def log_info(msg: str):
    print(f"{Colors.BLUE}[INFO]{Colors.ENDC} {msg}")

def log_success(msg: str):
    print(f"{Colors.GREEN}[ÉXITO]{Colors.ENDC} {msg}")

def log_warn(msg: str):
    print(f"{Colors.WARNING}[AVISO]{Colors.ENDC} {msg}")

def log_error(msg: str):
    print(f"{Colors.FAIL}[ERROR]{Colors.ENDC} {msg}")

def log_title(msg: str):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}\n {msg}\n{'='*60}{Colors.ENDC}\n")

ROOT_DIR = Path(__file__).resolve().parent

def check_command(cmd: str) -> bool:
    """Verifica si un comando está instalado y accesible en el PATH del sistema."""
    return shutil.which(cmd) is not None

def get_docker_compose_cmd():
    """Detecta si se usa el plugin moderno 'docker compose' o el binario clásico 'docker-compose'."""
    if check_command("docker"):
        # Probar docker compose
        try:
            res = subprocess.run(["docker", "compose", "version"], capture_output=True, text=True, check=False)
            if res.returncode == 0:
                return ["docker", "compose"]
        except Exception:
            pass

    if check_command("docker-compose"):
        return ["docker-compose"]

    return None

def check_environment():
    """Diagnóstico rápido del entorno."""
    log_title("VERIFICACIÓN DEL ENTORNO DE TRABAJO")
    has_all = True

    # Python
    py_ver = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    log_success(f"Python instalado: v{py_ver}")

    # Node.js
    if check_command("node"):
        res = subprocess.run(["node", "-v"], capture_output=True, text=True)
        log_success(f"Node.js instalado: {res.stdout.strip()}")
    else:
        log_warn("Node.js no encontrado en PATH (necesario para modo desarrollo o build manual sin Docker).")
        has_all = False

    # npm
    if check_command("npm"):
        res = subprocess.run(["npm", "-v"], capture_output=True, text=True)
        log_success(f"npm instalado: v{res.stdout.strip()}")
    else:
        log_warn("npm no encontrado en PATH.")
        has_all = False

    # Docker
    if check_command("docker"):
        res = subprocess.run(["docker", "-v"], capture_output=True, text=True)
        log_success(f"Docker instalado: {res.stdout.strip()}")
    else:
        log_warn("Docker no detectado (necesario para despliegue en contenedores).")
        has_all = False

    # Docker Compose
    compose_cmd = get_docker_compose_cmd()
    if compose_cmd:
        cmd_str = " ".join(compose_cmd)
        log_success(f"Docker Compose disponible mediante: '{cmd_str}'")
    else:
        log_warn("Docker Compose no detectado.")
        has_all = False

    print()
    if has_all:
        log_success("¡Todo el entorno está configurado adecuadamente!")
    else:
        log_info("Puedes utilizar Docker o Node.js según tu método preferido de ejecución.")

def ensure_dependencies():
    """Instala dependencias de npm si node_modules no existe."""
    node_modules = ROOT_DIR / "node_modules"
    if not node_modules.exists():
        log_info("Carpeta 'node_modules' no encontrada. Instalando dependencias del proyecto...")
        subprocess.run(["npm", "install"], cwd=str(ROOT_DIR), check=True)
        log_success("Dependencias instaladas con éxito.")

def run_dev():
    """Ejecuta el servidor de desarrollo Vite."""
    log_title("INICIANDO SERVIDOR DE DESARROLLO (VITE)")
    if not check_command("npm"):
        log_error("Se requiere npm para ejecutar en modo desarrollo local.")
        sys.exit(1)
    ensure_dependencies()
    try:
        subprocess.run(["npm", "run", "dev"], cwd=str(ROOT_DIR), check=True)
    except KeyboardInterrupt:
        log_info("\nServidor de desarrollo detenido por el usuario.")

def run_build():
    """Compila el proyecto para producción."""
    log_title("COMPILANDO PROYECTO PARA PRODUCCIÓN")
    if not check_command("npm"):
        log_error("Se requiere npm para compilar el proyecto.")
        sys.exit(1)
    ensure_dependencies()
    res = subprocess.run(["npm", "run", "build"], cwd=str(ROOT_DIR))
    if res.returncode == 0:
        log_success("Compilación completada. Archivos listos en la carpeta 'dist/'.")
    else:
        log_error("Error durante la compilación del proyecto.")
        sys.exit(res.returncode)

def run_docker_up(detached=True):
    """Construye y levanta los contenedores con Docker Compose."""
    log_title("DESPLEGANDO CON DOCKER COMPOSE")
    compose_cmd = get_docker_compose_cmd()
    if not compose_cmd:
        log_error("Docker o Docker Compose no están instalados o el daemon de Docker no está en ejecución.")
        log_info("Asegúrate de instalar Docker Desktop / Docker Engine e iniciarlo.")
        sys.exit(1)

    cmd = compose_cmd + ["up", "--build"]
    if detached:
        cmd.append("-d")

    log_info(f"Ejecutando: {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=str(ROOT_DIR))
    if res.returncode == 0:
        log_success("¡Contenedor levantado exitosamente!")
        print(f"\n{Colors.BOLD}{Colors.GREEN}>> Aplicación disponible en:{Colors.ENDC} {Colors.CYAN}http://localhost:3000{Colors.ENDC}")
        print(f"{Colors.BLUE}Para ver logs:{Colors.ENDC} python run.py logs")
        print(f"{Colors.BLUE}Para detener:{Colors.ENDC} python run.py down\n")
    else:
        log_error("Error al iniciar los contenedores con Docker Compose.")
        sys.exit(res.returncode)

def run_docker_down():
    """Detiene los contenedores de Docker Compose."""
    log_title("DETENIENDO CONTENEDORES DOCKER")
    compose_cmd = get_docker_compose_cmd()
    if not compose_cmd:
        log_error("Docker Compose no está disponible.")
        sys.exit(1)

    cmd = compose_cmd + ["down"]
    subprocess.run(cmd, cwd=str(ROOT_DIR))
    log_success("Contenedores detenidos.")

def run_docker_logs():
    """Muestra los logs en vivo del contenedor Docker."""
    compose_cmd = get_docker_compose_cmd()
    if not compose_cmd:
        log_error("Docker Compose no está disponible.")
        sys.exit(1)

    cmd = compose_cmd + ["logs", "-f"]
    try:
        subprocess.run(cmd, cwd=str(ROOT_DIR))
    except KeyboardInterrupt:
        log_info("\nLectura de logs finalizada.")

def run_python_server(port=3000):
    """
    Sirve la carpeta 'dist' mediante un servidor HTTP integrado en Python,
    con soporte para rutas de Single Page Application (SPA).
    """
    dist_dir = ROOT_DIR / "dist"
    if not dist_dir.exists():
        log_warn("Carpeta 'dist' no encontrada. Ejecutando compilación primero...")
        run_build()

    from http.server import SimpleHTTPRequestHandler
    from socketserver import TCPServer

    class SPAServerHandler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(dist_dir), **kwargs)

        def do_GET(self):
            # Si el archivo no existe, responder con index.html (regla SPA)
            path = self.translate_path(self.path)
            if not os.path.exists(path) or os.path.isdir(path):
                index_candidate = os.path.join(path, "index.html") if os.path.isdir(path) else None
                if not (index_candidate and os.path.exists(index_candidate)):
                    self.path = "/index.html"
            return super().do_GET()

    log_title(f"SERVIDOR LOCAL DE PRODUCCIÓN (PUERTO {port})")
    print(f"{Colors.BOLD}{Colors.GREEN}>> Aplicación disponible en:{Colors.ENDC} {Colors.CYAN}http://localhost:{port}{Colors.ENDC}")
    print(f"Presiona {Colors.BOLD}Ctrl+C{Colors.ENDC} para detener el servidor.\n")

    # Permitir reutilización de puerto inmediatamente
    TCPServer.allow_reuse_address = True
    try:
        with TCPServer(("", port), SPAServerHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        log_info("\nServidor detenido por el usuario.")

def show_interactive_menu():
    """Menú interactivo cuando se ejecuta `python run.py` sin argumentos."""
    while True:
        log_title("METTAV GROUP SAS - PANEL DE CONTROL Y DESPLIEGUE")
        print("Selecciona una opción:")
        print(f"  {Colors.BOLD}1){Colors.ENDC} Iniciar servidor de desarrollo local (npm run dev)")
        print(f"  {Colors.BOLD}2){Colors.ENDC} Compilar aplicación para producción (npm run build)")
        print(f"  {Colors.BOLD}3){Colors.ENDC} Desplegar con Docker Compose (segundo plano)")
        print(f"  {Colors.BOLD}4){Colors.ENDC} Desplegar con Docker Compose (en primer plano con logs)")
        print(f"  {Colors.BOLD}5){Colors.ENDC} Ver logs del contenedor Docker")
        print(f"  {Colors.BOLD}6){Colors.ENDC} Detener contenedores Docker (docker compose down)")
        print(f"  {Colors.BOLD}7){Colors.ENDC} Servir aplicación compilada (Servidor Python SPA en puerto 3000)")
        print(f"  {Colors.BOLD}8){Colors.ENDC} Verificar entorno y requisitos (Docker, Node, npm)")
        print(f"  {Colors.BOLD}0){Colors.ENDC} Salir")

        try:
            choice = input(f"\n{Colors.CYAN}Ingresa una opción [0-8]: {Colors.ENDC}").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nSaliendo...")
            break

        if choice == "1":
            run_dev()
            break
        elif choice == "2":
            run_build()
        elif choice == "3":
            run_docker_up(detached=True)
            break
        elif choice == "4":
            run_docker_up(detached=False)
            break
        elif choice == "5":
            run_docker_logs()
        elif choice == "6":
            run_docker_down()
        elif choice == "7":
            run_python_server()
            break
        elif choice == "8":
            check_environment()
        elif choice == "0":
            print("¡Hasta luego!")
            break
        else:
            log_warn("Opción no válida. Por favor intenta de nuevo.")

        time.sleep(1)

def main():
    parser = argparse.ArgumentParser(
        description="Script de gestión y despliegue para METTAV GROUP SAS",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  python run.py dev           # Iniciar Vite en desarrollo
  python run.py build         # Compilar para producción (carpeta dist/)
  python run.py docker        # Construir y levantar con Docker Compose
  python run.py down          # Detener contenedores Docker
  python run.py logs          # Ver logs de Docker en vivo
  python run.py serve         # Servir carpeta dist con servidor Python integrado (puerto 3000)
  python run.py check         # Diagnosticar estado de dependencias del sistema
  python run.py               # Abrir menú interactivo
"""
    )
    parser.add_argument(
        "action",
        nargs="?",
        choices=["dev", "build", "docker", "up", "down", "stop", "logs", "serve", "preview", "check"],
        help="Acción a realizar"
    )
    parser.add_argument("--port", type=int, default=3000, help="Puerto para servidor local (por defecto: 3000)")

    args = parser.parse_args()

    if not args.action:
        show_interactive_menu()
    elif args.action == "dev":
        run_dev()
    elif args.action == "build":
        run_build()
    elif args.action in ["docker", "up"]:
        run_docker_up(detached=True)
    elif args.action in ["down", "stop"]:
        run_docker_down()
    elif args.action == "logs":
        run_docker_logs()
    elif args.action == "serve":
        run_python_server(port=args.port)
    elif args.action == "preview":
        if not check_command("npm"):
            log_error("Se requiere npm para ejecutar preview.")
            sys.exit(1)
        subprocess.run(["npm", "run", "preview"], cwd=str(ROOT_DIR))
    elif args.action == "check":
        check_environment()

if __name__ == "__main__":
    main()
