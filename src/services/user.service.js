import bcrypt from 'bcryptjs'

import User from '../models/user.model.js'

import Audit from '../models/audit.model.js'

import mongoose from 'mongoose'


const getUsersService = async ({email, id, requesterRole, requesterId}) => {
    console.log("📦 SERVICE -> getUsersService");
console.log("user.role:", email);
console.log("currentUserId:", id);
    try {
        const role = requesterRole?.toUpperCase();
        const currentUserId = requesterId?.toString();
        if (!role) {
            throw {
                statusCode: 403,
                message: "No tienes permisos para ver usuarios",
            };
        }

        if (role === "GUEST") {
            throw {
                statusCode: 403,
                message: "No tienes permisos para ver usuarios",
            };
        }

    // Buscar por ID
        if (id) {
            if(!mongoose.Types.ObjectId.isValid(id)) {
                throw {
                    statusCode:400,
                    message: "Id inválido",
                };
            }

            if (role === "USER" &&  id !== currentUserId) {
                throw {
                    statusCode: 403,
                message: "No tienes permisos para ver este usuario",
                };
            }
        
            const user = await User.findById(id).select("-password");
            if (!user) {
                throw {
                    statusCode: 404,
                    message: "Usuario no encontrado",
                };
            }
            if (role === "ADMIN" && user.role === "ROOT") {
                throw {
                    statusCode: 403,
                    message: "No tienes permisos para ver usuarios root",
                };
            }

            return user;
        }

    // Buscar por email
        if(email) {
            const user = await User.findOne({email}).select("-password");

            if (!user) {
                throw {
                    statusCode: 404,
                    message: "Usuario no encontrado",
                };
            }

            if (role === "USER" && user._id.toString() !== currentUserId) {
                throw {
                    statusCode: 403,
                    message: "No tienes permisos para ver este usuario",
                };
            }
            
            if (role === "ADMIN" && user.role === "ROOT") {
                throw {
                    statusCode: 403,
                    message: "No tienes permisos para ver este usuario",
                };
            }
            return user;
        }

        if (role ==="USER") {
            const user = await User.findById(currentUserId).select("-password");
            if (!user) {
                throw {
                    statusCode: 404,
                    message: "Usuario no encontrado",
                };
            }
            return user; 
        }
        
        if (role === "ADMIN") {
            return await User.find({ role: { $ne: "ROOT" } }).select("-password").sort({ nombre: 1 });
        }
        return await User.find().select("-password").sort({ nombre: 1 });
    } catch (error) {
        console.error("❌ Error en getUsersService:", error);
        throw {
            statusCode: error.statusCode || 500,
            message: error.message || "Error interno del servidor",
            errrors: error.errors || null,
        };
    };
};

const createUserService = async (data) => {
    console.log('📦 SERVICE -> createUserService');

    try {
        const existUser = await User.findOne({
            email: data.email,
        });

        if(existUser) {
            throw {
                statusCode: 409,
                message: "El usuario ya existe",
            };
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = new User({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            fechaNacimiento: data.fechaNacimiento,
            password: hashedPassword,
            edad: data.edad,
            genero: data.genero,
            telefono: data.telefono,
            direccion: data.direccion,
            localidad: data.localidad,
            provincia: data.provincia,
            pais: data.pais,
            codigoPostal: data.codigoPostal,
            role: data.role  // Si no viene, el schema asignará USER por defecto
        });

        await user.save();

        return {
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            fechaNacimiento: user.fechaNacimiento,
            edad: user.edad,
            genero: user.genero,
            telefono: user.telefono,
            direccion: user.direccion,
            localidad: user.localidad,
            provincia: user.provincia,
            pais: user.pais,
            codigoPostal: user.codigoPostal,
            role: user.role
        };
    } catch (error) {
        console.error(
            "❌ Error en createUserService:",
            error
        );
        throw {
            statusCode:
                error.statusCode || 500,
            message:
                error.message || "Error interno del Servidor",
            errors:
                error.errors || null,
        };
    }
};

const updateUserService = async (id, data) => {
    console.log('📦 SERVICE -> updateUserService');

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                statusCode: 400,
                message: "Id inválido",
            };
        }

        const user = await User.findById(id)
    
        if (!user) {
            throw {
                statusCode: 404,
                message: "Usuario no encontrado",
            };
        }

        // El email existe pero no es modificable
        if (data.email !== undefined) {
            throw {
                statusCode: 400,
                message: "El email no puede modificarse",
            };
        }
        const allowedFields = [
            "nombre",
            "apellido",
            "fechaNacimiento",
            "edad",
            "genero",
            "telefono",
            "direccion",
            "localidad",
            "provincia",
            "pais",
            "codigoPostal",
            "role"
        ];

    // Update parcial
    /*if (data.nombre) user.nombre = data.nombre
    if (data.apellido) user.apellido = data.apellido
    if (data.edad) user.edad = data.edad
    if (data.genero) user.genero = data.genero
    if (data.telefono) user.telefono = data. telefono
    if (data.direccion) user.direccion = data.direccion
    if (data.localidad) user.localidad = data.localidad
    if (data.provincia) user.provincia = data.provincia
    if (data.pais) user.pais = data.pais
    if (data.codigoPostal) user.codigoPostal = data.codigoPostal*/

        allowedFields.forEach((field) => {
            if (data[field] !== undefined) {
                user[field] = data[field];
            }
        });

    // Actualizar password si viene informada
    if (data.password !== undefined) {
        user.password = await bcrypt.hash(data.password, 10);
    }

    await user.save();

        return {
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            fechaNacimiento: user.fechaNacimiento,
            edad: user.edad,
            genero: user.genero,
            telefono: user.telefono,
            direccion: user.direccion,
            localidad: user.localidad,
            provincia: user.provincia,
            pais: user.pais,
            codigoPostal: user.codigoPostal,
            role: user.role
        };
    } catch (error) {
        console.error(
            "❌ Error en updateUserService:",
            error
        );
        throw {
            statusCode:
                error.statusCode || 500,
            message:
                error.message || "Error interno del servidor",
            errors:
                error.errors || null,
        };
    }
};

const deleteUserService = async (id, requester = {}) => {
    console.log('📦 SERVICE -> deleteUserService')

    let session;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw {
                satusCode: 400,
                message: "Id inválido",
            };
        }

        session = await mongoose.startSession();

        await session.withTransaction(async () => {
            const user = await User.findById(id).session(session);

            if (!user) {
                throw {
                    statusCode: 404,
                    message: "Usuario no encontrado",
                };
            }

            const requesterId = requester?.userId?.toString();
            if (requesterId && requesterId === id) {
                throw {
                    statusCode: 403,
                    message: "No puedes eliminar tu propio usuario",
                };
            }

            await Audit.create(
                [
                    {
                        usuarioEliminado: user.toObject(),
                        fechaNacimiento: new Date(),
                    },
                ],
                { session }
            );

            await user.deleteOne({ session });
        });

        return {
            message: 'Usuario eliminado'
        };
    } catch (error) {
        console.error(
            "❌ Error en deleteUserService:",
            error
        );
        throw {
            statusCode:
                error.statusCode || 500,
            message:
                error.message || "Error interno del servidor",
            errors:
                error.errors || null,
        };
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

export { 
    getUsersService,
    createUserService,
    updateUserService,
    deleteUserService
};