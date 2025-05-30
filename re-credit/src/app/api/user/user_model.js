const pool = require('pg/lib/db.js'); // Импортируем pool

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
        resolve(results.rows.length > 0);
      }
    );
  });
};
//POST
const createUser = (body) => {
  return new Promise(function(resolve, reject) {
    const { login, password, firstname, lastname, birthdate, phonenumber, inn, passportserie, passportnumber, income, country } = body;
    
    pool.query(
      'INSERT INTO _users (login, password, firstname, lastname, birthdate, phonenumber, inn, passportserie, passportnumber, income, country) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', 
      [login, password, firstname, lastname, birthdate, phonenumber, inn, passportserie, passportnumber, income, country], 
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.rows[0]); // Возвращаем созданного пользователя
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
    const {id,login, password, firstname, lastname, birthdate, phonenumber, inn, passportserie, passportnumber, income, country} = body
    console.log(login, password, firstname, lastname, birthdate, phonenumber, inn, passportserie, passportnumber, income, country)
    pool.query('UPDATE customers SET firstname = $3, lastname = $4, birthdate=$5, phonenumber =$6, inn = $7, passportseries = $8, passportnumber = $9, income = $10, country = $11 WHERE id_user = $1', [id, login, password, firstname, lastname, birthdate, phonenumber, inn, passportserie, passportnumber, income, country], (error, results) => {
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