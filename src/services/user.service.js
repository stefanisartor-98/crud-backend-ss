const getUsersService = async () -> {
    try {
        console.log('SERVICE -> getUserService')

        return []
    } catch (error) {
        throw error
    }
}

const createUserService = async (data) => {
    try {
        console.log('SERVICE -> createUserService')
        console.log(data)

        return data
    } catch (error) {
        throw error
    }
}

const updateUserService = async (id, data) => {
    try {
        console.log('SERVICE -> updateUserService')
        console.log(id)
        console.log(data)

        return {
            id,
            ...data
        }
    } catch (error) {
        throw error
    }
}