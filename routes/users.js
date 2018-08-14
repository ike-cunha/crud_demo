var express = require('express')
var app = express()
 
// LISTA DE MÚSICOS - SELECT ALL
app.get('/', function(req, res, next) {
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM musico ORDER BY id DESC',function(err, rows, fields) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                res.render('user/list', {
                    title: 'User List', 
                    data: ''
                })
            } else {
                // render to views/user/list.ejs template file
                res.render('user/list', {
                    title: 'Listagem de musicos', 
                    data: rows
                })
            }
        })
    })
})
 
// RENDER FORMULARIO DE ADICAO DE MUSICO
app.get('/add', function(req, res, next){    
    // render to views/user/add.ejs
    res.render('user/add', {
        title: 'Adicionar novo musico',
        nome: '',
        idade: '',
        instrumentoToca: '',
        email: ''
    })
})
 
// POST - ADICIONAR NOVO MUSICO
app.post('/add', function(req, res, next){    
    req.assert('nome', 'Por favor, insira o nome.').notEmpty()
    req.assert('idade', 'Por favor, insira a idade').notEmpty()
    req.assert('instrumentoToca', 'Qual instrumento o musico toca?').notEmpty()
    req.assert('email', 'Por favor, insira um email valido').isEmail()
 
    var errors = req.validationErrors()
    //req.getValidationResult
    
    if( !errors ) {

        var user = {
            nome: req.sanitize('nome').escape().trim(),
            idade: req.sanitize('idade').escape().trim(),
            instrumentoToca: req.sanitize('instrumentoToca').escape().trim(),
            email: req.sanitize('email').escape().trim()
        }
        
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO musico SET ?', user, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/user/add.ejs
                    res.render('user/add', {
                        title: 'Adicionar novo musico',
                        nome: user.nome,
                        idade: user.idade,
                        instrumentoToca: user.instrumentoToca,
                        email: user.email                    
                    })
                } else {                
                    req.flash('success', 'Musico adicionado com sucesso.')
                    
                    // render to views/user/add.ejs
                    res.render('user/add', {
                        title: 'Adicionar novo musico',
                        nome: '',
                        idade: '',
                        instrumentoToca: '',
                        email: ''                    
                    })
                }
            })
        })
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })                
        req.flash('error', error_msg)        
        
        res.render('user/add', { 
            title: 'Adicionar novo musico',
            nome: req.body.nome,
            idade: req.body.idade,
            instrumentoToca: req.body.instrumentoToca,
            email: req.body.email
        })
    }
})
 
// FORMULARIO EDICAO DO MUSICO
app.get('/edit/(:id)', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM musico WHERE id = ' + req.params.id, function(err, rows, fields) {
            if(err) throw err
            
            // MUSICO NAO ENCONTRADO
            if (rows.length <= 0) {
                req.flash('error', 'Musico nao encontrado (ID = ' + req.params.id + ')')
                res.redirect('/users')
            }
            else { // MUSICO ENCONTRADO
                res.render('user/edit', {
                    title: 'Editar musico', 
                    //data: rows[0],
                    id: rows[0].id,
                    nome: rows[0].nome,
                    idade: rows[0].idade,
                    instrumentoToca: rows[0].instrumentoToca,
                    email: rows[0].email                    
                })
            }            
        })
    })
})
 
// POST - EDICAO MUSICO
app.put('/edit/(:id)', function(req, res, next) {
    req.assert('nome', 'Por favor, insira o nome.').notEmpty()
    req.assert('idade', 'Por favor, insira a idade').notEmpty()
    req.assert('instrumentoToca', 'Qual instrumento o musico toca?').notEmpty()
    req.assert('email', 'Por favor, insira um email valido').isEmail()
 
    var errors = req.validationErrors()
    
    if( !errors ) {
        
        var user = {
            nome: req.sanitize('nome').escape().trim(),
            idade: req.sanitize('idade').escape().trim(),
            instrumentoToca: req.sanitize('instrumentoToca').escape().trim(),
            email: req.sanitize('email').escape().trim()
        }
        
        req.getConnection(function(error, conn) {
            conn.query('UPDATE musico SET ? WHERE id = ' + req.params.id, user, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/user/add.ejs
                    res.render('user/edit', {
                        title: 'Editar musico',
                        id: req.params.id,
                        nome: req.body.nome,
                        idade: req.body.idade,
                        instrumentoToca: req.body.instrumentoToca,
                        email: req.body.email
                    })
                } else {
                    req.flash('success', 'Musico atualizado com sucesso.')
                    
                    // render to views/user/add.ejs
                    res.render('user/edit', {
                        title: 'Editar musico',
                        id: req.params.id,
                        nome: req.body.nome,
                        idade: req.body.idade,
                        instrumentoToca: req.body.instrumentoToca,
                        email: req.body.email
                    })
                }
            })
        })
    }
    else {   //Display errors to user
        var error_msg = 'Erro ao inserir no banco de dados'
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        
        res.render('user/edit', { 
            title: 'Edit User',            
            id: req.params.id, 
            nome: req.body.nome,
            idade: req.body.idade,
            instrumentoToca: req.body.instrumentoToca,
            email: req.body.email
        })
    }
})
 
// DELETE MUSICO
app.delete('/delete/(:id)', function(req, res, next) {
    var user = { id: req.params.id }
    
    req.getConnection(function(error, conn) {
        conn.query('DELETE FROM musico WHERE id = ' + req.params.id, user, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                // redirect to users list page
                res.redirect('/users')
            } else {
                req.flash('success', 'Musico retirado com sucesso(ID = ' + req.params.id + ')')
                // redirect to users list page
                res.redirect('/users')
            }
        })
    })
})
 
module.exports = app