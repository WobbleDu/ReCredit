const pool = require('../db.js'); // Импортируем pool

//GET
const getUsers = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM _users ORDER BY id_user ASC', (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows); 
    })
  }) 
}

//GET
const getUserByID = (id) => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM _users WHERE id_user = $1', [id], (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.rows.length === 0) {
          resolve(null);  // Пользователь не найден - резолвим с null или пустым объектом
        } else {
          resolve(results.rows[0]);
        }
    })
  })
}
//POST
const checkLogin = (body) => {
  return new Promise((resolve, reject) => {
    const { login, password } = body;
    
    if (!login || !password) {
      return resolve(false); // Возвращаем false вместо reject
    }

    pool.query(
      'SELECT id_user FROM _users WHERE login = $1 AND password = $2',
      [login, password],
      (error, results) => {
        if (error) {
          console.error('Ошибка при проверке логина:', error);
          return resolve(false); // При ошибке тоже возвращаем false
        }
        
        // Возвращаем true если пользователь найден, false если нет
        const user = results.rows[0];
        resolve(user ? user.id_user : false);
      }
    );
  });
};
//POST
const createUser = (body) => {
  return new Promise(function(resolve, reject) {
    // Проверка обязательных полей
    const requiredFields = ['login', 'password', 'firstname', 'lastname', 'birthdate', 
                          'phonenumber', 'inn', 'passportserie', 'passportnumber', 'country'];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        reject(new Error(`Поле ${field} является обязательным`));
        return;
      }
    }   

    const { login, password, firstname, lastname, birthdate, 
           phonenumber, inn, passportserie, passportnumber, income, country } = body;

    pool.query(
      `INSERT INTO _users 
       (login, password, firstname, lastname, birthdate, phonenumber, inn, passportserie, passportnumber, income, country) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING id_user`, // Явно указываем, что хотим вернуть ID
      [login, password, firstname, lastname, birthdate, phonenumber, inn, passportserie, passportnumber, income, country], 
      (error, results) => {
        if (error) {
          // Обработка ошибки уникальности логина
          if (error.code === '23505' && error.constraint === '_users_login_key') {
            reject(new Error('Пользователь с таким логином уже существует'));
          } else {
            reject(error);
          }
        } else {
          // Возвращаем данные нового пользователя
          resolve(results.rows[0]);
        }
      }
    );
  });
};

//DELETE
const deleteUser = (id) => {
  return new Promise(function(resolve, reject) {

    pool.query('DELETE FROM _users WHERE id_user = $1', [id], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`User deleted with ID: ${id}`)
    })
  })
}

//PUT
const editUserByID = (body) => {
  return new Promise(function(resolve, reject) {
    const {id,login, password, firstname, lastname, birthdate, phonenumber, inn, passportserie, passportnumber, income, country, dti} = body
    console.log(id,login, password, firstname, lastname, birthdate, phonenumber, inn, passportserie, passportnumber, income, country, dti)
    pool.query('UPDATE _users SET firstname = $2, lastname = $3, birthdate=$4, phonenumber =$5, inn = $6, passportserie = $7, passportnumber = $8, income = $9, country = $10 WHERE id_user = $1', [id, firstname, lastname, birthdate, phonenumber, inn, passportserie, passportnumber, income, country], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`User edited`);
    })
  })
}

module.exports = {
  getUsers,
  getUserByID,
  createUser,
  deleteUser,
  editUserByID,
  checkLogin
}