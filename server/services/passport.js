const User = require("../models/user");
const config = require("../config");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy; //strategy p/ autenticar com jwt
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local"); //strategy p/ autenticar com username/senha

const localOptions = {
  //usernameField é qual a propriedade do req.body da requisição que está o username do login, por padrão ele olha a propriedade username e p/ senha a  password
  //porem como estamos usando email pra fazer login , passamos a propriedade email do req.body
  usernameField: "email"
};
const localLogin = new LocalStrategy(localOptions, async function(
  email,
  password,
  done
) {
  //o localStrategy pega o username(email no caso) e password da requisição e passa via argumento ao callback
  try {
    const user = await User.findOne({ email: email });
    if (!user) return done(null, false);
    if (await user.comparePassword(password)) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    done(err, false);
  }
});

//objeto de configuração da Strategy para autenticação via jwt
//vamos aqui dizer pro passport onde está o token que vem na requisição
//no caso o token vem via header com nome de authorization
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"), //função pra extrair o token do header passado
  secretOrKey: config.secret //diz pro passport qual a key secreta usada pra criar o token, assim ele pode usar a key pra decodificar o token
};

//done -> devemos executar ao terminar a autenticação, tanto em caso de ter conseguido autenticar quanto no caso de não conseguir
//payload -> é o payload usado pra criar o jwt token , contendo as informações básicas do usuario, o strategy automaticamente extrai ele após ter decodificado usando as informações passadas no jwtOptions
const jwtLogin = new JwtStrategy(jwtOptions, async function(payload, done) {
  try {
    const user = await User.findById(payload.sub);
    if (user) {
      done(null, user); //se achar o usuario, executa o done, passando null p dizer que nao teve erro e no 2 argumento passa o usuario autenticado pela busca no banco para a requisição(chega pelo req.user)
    } else {
      done(null, false); //não há erro (null), mas não existe usuario com esse token logo autenticação não foi realizada
    }
  } catch (err) {
    done(err, false); //executar done , passando o erro e false significa que a autenticação não foi completada pelo erro e não se encontrou um usuario com o token passado
  }
});

passport.use(localLogin); //diz ao passport para usar o localLogin pra fazer autenticações
passport.use(jwtLogin); //diz ao passport para usar o jwtLogin pra fazer autenticações

//cria a middleware do passport, usando o metodo local e o jwt como autenticação, e dizendo pra não usar cookies(session), pois por padrão se usa cookies p autenticar
const requireSignIn = passport.authenticate("local", { session: false });
const requireAuth = passport.authenticate("jwt", { session: false });
//exporta as duas middlewares de autenticação
module.exports = {
  requireSignIn,
  requireAuth
};
