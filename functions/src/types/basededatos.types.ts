
/**
 * Interfaz de métodos disponibles para conexiones de base de datos.
 */
interface BasedeDatos {

    desconectar: () => Promise<void>;

    estaConectado: () => boolean;

    obtenerDatos: <T, Q>(ruta: string, query: Q) => Promise<T | T[] | null>;

    guardarDatos: <T>(ruta: string, datos: T) => Promise<boolean>;

    eliminarDatos: <I>(ruta: string, id: I) => Promise<boolean>;

    actualizarDatos: <T, I>(ruta: string, datos: Partial<T>, id: I) => Promise<void>;
}
export {BasedeDatos};
