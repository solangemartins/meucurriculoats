# Meu Currículo ATS

PROMPT ÚNICO — GERADOR DE CURRÍCULOS ATS FRIENDLY

Crie do zero uma aplicação web completa, responsiva e pronta para produção chamada provisoriamente Currículo ATS.

O objetivo é permitir que qualquer pessoa crie, edite e visualize gratuitamente um currículo profissional compatível com sistemas ATS, sem precisar fazer cadastro antecipado. O cadastro ou login será solicitado somente quando a pessoa tentar salvar o currículo em sua conta ou exportá-lo em PDF.

Implemente todo o projeto solicitado neste único comando. Antes de concluir, revise o funcionamento das páginas, fluxos, banco de dados, autenticação, responsividade e geração do PDF.

1. Tecnologias e estrutura

Utilize:

React com TypeScript;

Tailwind CSS;

componentes do shadcn/ui;

Lucide Icons;

Lovable Cloud para banco de dados e autenticação;

React Hook Form com Zod para validação;

arquitetura organizada, reutilizável e preparada para expansão;

interface em português do Brasil;

datas, mensagens e textos em padrão brasileiro;

aplicação responsiva para computador, tablet e celular.

Use componentes shadcn/ui sempre que forem adequados, incluindo:

Button;

Card;

Input;

Textarea;

Label;

Select;

Dialog;

Sheet;

Dropdown Menu;

Tabs;

Accordion;

Tooltip;

Toast/Sonner;

Alert Dialog;

Skeleton;

Progress;

Separator.

Não utilize dados simulados para funcionalidades que precisam persistir. Conecte autenticação, perfil e currículos salvos ao banco de dados real do projeto.

2. Design system

Crie um design elegante, moderno, confiável, profissional e acolhedor, usando as seguintes cores principais:

Azul-claro: #EFFAFD — fundos suaves, áreas de apoio e seções secundárias;

Azul royal: #4A8BDF — botões principais, links, destaques e estados ativos;

Berinjela: #A0006D — chamadas especiais, detalhes estratégicos e contraste visual.

Crie variáveis semânticas no tema para:

background;

foreground;

primary;

primary-foreground;

secondary;

secondary-foreground;

accent;

accent-foreground;

muted;

border;

input;

ring;

destructive;

success;

warning.

Requisitos visuais:

ótima legibilidade e contraste;

aparência profissional;

espaços bem distribuídos;

cantos suavemente arredondados;

sombras discretas;

estados de hover, foco, carregamento, sucesso e erro;

foco visível para navegação por teclado;

não utilizar gradientes excessivos;

não exagerar no uso da cor berinjela;

utilizar fundo branco ou azul-claro nas áreas principais;

botões primários em azul royal;

CTAs especiais e pequenos destaques em berinjela.

A interface do site pode ser moderna e visual, mas o currículo exportado deverá seguir regras específicas de compatibilidade ATS.

3. Navegação principal

Crie um cabeçalho responsivo com:

logotipo textual;

link “Início”;

link “Criar currículo”;

link “Meus currículos”;

botão “Entrar” quando não houver sessão;

menu do usuário quando estiver autenticado.

No menu autenticado, disponibilize:

Meu perfil;

Meus currículos;

Sair.

No celular, utilize menu lateral ou menu recolhível com boa usabilidade.

4. Página inicial

Crie uma página inicial clara e persuasiva contendo:

Seção principal

título: “Crie um currículo profissional e preparado para sistemas ATS”;

subtítulo explicando que o usuário pode preencher, editar e visualizar o currículo gratuitamente antes de criar uma conta;

botão principal: “Criar meu currículo”;

botão secundário: “Já tenho uma conta”;

representação visual discreta de um currículo profissional.

Benefícios

Apresente benefícios como:

estrutura compatível com sistemas ATS;

edição fácil;

visualização em tempo real;

exportação em PDF;

possibilidade de salvar e editar posteriormente;

conteúdo organizado de maneira profissional.

Como funciona

Mostrar três passos:

Preencha suas informações;

Personalize e revise o currículo;

Entre ou crie uma conta para salvar ou exportar.

Explicação sobre ATS

Inclua uma seção curta explicando, em linguagem simples, que sistemas ATS são usados por empresas para ler e organizar currículos e que uma estrutura limpa aumenta as chances de o conteúdo ser interpretado corretamente.

Inclua rodapé com:

Termos de Uso;

Política de Privacidade;

Contato;

aviso de direitos reservados.

5. Acesso livre antes do cadastro

O visitante deve conseguir:

acessar a página inicial;

começar um currículo;

preencher todas as informações;

editar o conteúdo;

escolher um modelo;

visualizar o currículo completo;

navegar entre todas as etapas do editor;

consultar dicas de preenchimento.

Nada disso deve exigir login ou cadastro.

Durante a edição como visitante:

preserve automaticamente o rascunho no armazenamento local do navegador;

não apague o conteúdo se a página for atualizada;

exiba discretamente o estado “Rascunho salvo neste dispositivo”;

nunca armazene senha no armazenamento local;

quando o usuário entrar ou criar uma conta, mantenha o currículo que ele já estava editando;

após a autenticação, permita salvar esse rascunho na conta sem perder nenhum campo.

O sistema somente deverá abrir a solicitação de login ou cadastro quando o visitante clicar em:

“Salvar na minha conta”; ou

“Exportar em PDF”.

Depois que a autenticação for concluída, retorne automaticamente ao currículo em edição e continue a ação que foi solicitada, sem apagar os dados e sem obrigar o usuário a recomeçar.

6. Editor de currículo

Crie um editor simples, intuitivo e dividido por seções.

No computador:

formulário à esquerda;

pré-visualização do currículo à direita;

pré-visualização atualizada em tempo real;

painel de visualização fixo durante a rolagem quando houver espaço.

No celular:

utilize abas ou botões para alternar entre “Editar” e “Visualizar”;

mantenha os botões principais acessíveis;

evite formulários apertados ou difíceis de preencher.

Inclua indicador de progresso e salvamento automático do rascunho.

Informações pessoais

Campos:

nome completo;

cargo ou objetivo profissional;

cidade e estado;

telefone;

e-mail profissional;

LinkedIn;

portfólio ou site;

resumo profissional.

Não solicite foto, CPF, RG, estado civil, idade, gênero ou endereço completo.

Objetivo profissional

Permita informar:

cargo desejado;

área profissional;

breve objetivo.

Experiência profissional

Permita adicionar, editar, remover e reordenar várias experiências.

Campos:

cargo;

empresa;

cidade;

data de início;

data de término;

opção “Trabalho atualmente aqui”;

descrição das atividades;

conquistas e resultados.

Permita adicionar vários tópicos por experiência.

Formação acadêmica

Campos:

curso;

instituição;

nível de formação;

cidade;

data de início;

data de conclusão;

opção “Em andamento”.

Permita múltiplas formações.

Habilidades

Permita adicionar e remover habilidades individualmente.

Exemplos iniciais apenas como sugestão:

atendimento ao cliente;

Excel;

liderança;

vendas;

organização;

comunicação.

Não exiba barras, estrelas ou porcentagens no currículo.

Cursos e certificações

Campos:

nome;

instituição emissora;

ano ou data;

link opcional.

Idiomas

Campos:

idioma;

nível: básico, intermediário, avançado, fluente ou nativo.

Projetos

Campos:

nome do projeto;

descrição;

tecnologias ou competências;

link opcional.

Informações adicionais

Permita incluir:

trabalho voluntário;

prêmios;

publicações;

disponibilidade;

outras informações profissionais relevantes.

Todas as seções opcionais devem poder ser ocultadas quando estiverem vazias.

7. Ajuda para preencher o currículo

Inclua orientações curtas e úteis ao lado dos campos, sem inventar experiências ou qualificações.

Exemplos:

use verbos de ação;

destaque resultados mensuráveis;

evite textos genéricos;

utilize palavras relacionadas à vaga;

revise erros de português;

priorize experiências mais recentes.

Crie validações amigáveis e mensagens objetivas. Não bloqueie o usuário por campos opcionais vazios.

Inclua um indicador de qualidade do currículo baseado em regras transparentes, verificando, por exemplo:

presença de nome e contato;

objetivo profissional;

resumo;

experiências descritas;

formação;

habilidades;

clareza e preenchimento das seções.

Esse indicador deve ser apenas orientativo. Não prometa contratação nem aprovação em processos seletivos.

8. Modelos ATS Friendly

Disponibilize inicialmente três modelos:

Clássico;

Moderno;

Compacto.

Todos os modelos devem ser verdadeiramente compatíveis com ATS:

estrutura principal em uma única coluna;

texto real e selecionável;

títulos de seções padronizados;

ordem lógica de leitura;

fontes comuns e legíveis;

bom espaçamento;

datas em formato consistente;

margens apropriadas;

contraste alto;

links apresentados também como texto;

conteúdo textual preservado na exportação.

Não utilizar no currículo:

foto;

gráficos;

ícones substituindo palavras;

estrelas ou barras de habilidade;

caixas de texto flutuantes;

tabelas para organizar o conteúdo;

duas colunas no corpo principal;

informações importantes em cabeçalho ou rodapé;

elementos decorativos que prejudiquem a leitura;

fundos escuros;

dados transformados em imagem.

As cores do site não precisam aparecer intensamente no documento. No currículo, utilize predominantemente branco, preto, cinza-escuro e pequenos detalhes discretos em azul royal ou berinjela, sem comprometer a leitura por ATS.

9. Autenticação

O cadastro deve solicitar somente:

nome;

e-mail;

senha;

confirmação da senha.

Não solicitar telefone, CPF ou outras informações.

Regras da senha:

mínimo de oito caracteres;

mostrar e ocultar senha;

confirmação de senha;

informar claramente os requisitos.

O usuário não deverá precisar confirmar o e-mail, inserir código ou aguardar aprovação para acessar sua conta. Após o cadastro bem-sucedido:

criar o perfil;

iniciar a sessão automaticamente;

retornar ao currículo em edição;

executar a ação pendente de salvar ou exportar.

Configure o projeto para não exigir confirmação de e-mail antes do primeiro acesso, se essa opção estiver disponível no provedor de autenticação.

Na tela de login, incluir:

e-mail;

senha;

opção “Lembrar de mim”;

botão “Entrar”;

link “Esqueci minha senha”;

link para criar uma conta.

A opção “Lembrar de mim” deve utilizar persistência segura de sessão. Nunca salve ou exiba a senha em texto puro. Permita que o navegador ou gerenciador de senhas ofereça o salvamento da credencial usando atributos adequados de autocomplete.

Recuperação de senha

Implemente:

página para informar o e-mail;

envio de link seguro de redefinição;

página para criar e confirmar uma nova senha;

validação do link;

mensagens de sucesso, erro ou link expirado;

retorno ao login depois da alteração.

A confirmação de e-mail não será exigida para entrar normalmente. O link enviado por e-mail será usado somente quando o próprio usuário solicitar a redefinição da senha.

10. Modal de autenticação no momento da ação

Quando um visitante clicar em “Salvar na minha conta” ou “Exportar em PDF”, abra um Dialog responsivo com:

título explicando a ação;

mensagem informando que o currículo está pronto e não será perdido;

abas “Entrar” e “Criar conta”;

formulários completos;

opção de fechar e continuar editando;

indicador de carregamento;

mensagens claras de erro.

Exemplos de título:

“Entre para salvar seu currículo”;

“Seu currículo está pronto para ser exportado”.

Depois da autenticação, feche o modal, preserve todos os dados e execute automaticamente a ação original.

Não apresente o cadastro como bloqueio antes desse momento.

11. Currículos salvos

Cada usuário autenticado deverá acessar a página “Meus currículos”.

Permita:

visualizar seus currículos;

criar um novo;

continuar editando;

duplicar;

renomear;

exportar;

excluir mediante confirmação;

visualizar data da última atualização.

Cada cartão deverá mostrar:

nome do currículo;

cargo ou objetivo;

modelo utilizado;

data de atualização;

ações disponíveis.

Cada usuário só poderá visualizar e alterar os próprios dados.

Utilize políticas de segurança no banco para impedir acesso a currículos de outros usuários.

12. Salvamento

Quando o usuário estiver autenticado:

salve o currículo no banco de dados;

associe-o ao usuário correto;

mantenha data de criação e atualização;

mostre confirmação de salvamento;

implemente salvamento automático com debounce durante a edição;

evite criar registros duplicados a cada alteração;

permita salvamento manual;

indique os estados “Salvando”, “Salvo” e “Alterações pendentes”.

Se houver falha de conexão:

preserve os dados localmente;

informe o usuário;

permita tentar novamente;

não apague o currículo.

13. Exportação em PDF

Após a autenticação, permita exportar o currículo em PDF.

Requisitos:

arquivo em tamanho A4;

margens profissionais;

texto selecionável e pesquisável;

boa quebra entre páginas;

nenhuma seção cortada de forma inadequada;

links preservados quando possível;

fontes legíveis;

alta qualidade;

resultado fiel à visualização;

nome do arquivo no padrão curriculo-nome-do-usuario.pdf;

não incluir botões, controles do editor, menus ou elementos do site;

não gerar o currículo como uma imagem;

não utilizar captura de tela como solução principal;

preservar a ordem de leitura compatível com ATS.

Antes de gerar o arquivo:

valide os campos essenciais;

mostre avisos não bloqueantes sobre informações ausentes;

permita que o usuário volte para corrigir;

ofereça também a opção de continuar e exportar.

Após a exportação:

exiba mensagem de sucesso;

mantenha o usuário na página;

não apague o currículo;

salve automaticamente a versão atual na conta.

14. Perfil

Crie uma página simples de perfil com:

nome;

e-mail;

opção de alterar o nome;

opção de alterar a senha;

botão de sair;

opção de excluir a conta com confirmação reforçada.

Ao excluir a conta, explique que os currículos salvos também serão removidos. Não execute a exclusão sem confirmação explícita.

15. Banco de dados

Crie uma estrutura segura equivalente a:

Tabela profiles

id;

user_id;

name;

email;

created_at;

updated_at.

Tabela resumes

id;

user_id;

title;

target_role;

template;

resume_data em JSON estruturado;

created_at;

updated_at.

Requisitos:

relacionamento seguro com o usuário autenticado;

políticas de acesso por usuário;

índices úteis;

atualização automática de updated_at;

exclusão controlada;

nenhum usuário pode ler, editar ou excluir dados pertencentes a outro usuário.

Evite expor chaves privadas ou dados sensíveis no frontend.

16. Estados e mensagens

Implemente estados de:

carregamento;

vazio;

sucesso;

erro;

sessão expirada;

conexão indisponível;

currículo ainda não salvo;

nenhum currículo encontrado.

Exemplos:

“Seu rascunho foi salvo neste dispositivo.”

“Currículo salvo com sucesso.”

“Não foi possível salvar agora. Seu conteúdo continua protegido neste dispositivo.”

“Você ainda não possui currículos salvos.”

“Sua sessão expirou. Entre novamente para continuar.”

“PDF gerado com sucesso.”

Utilize Toast/Sonner para confirmações rápidas e Alert para informações que precisam permanecer visíveis.

17. Acessibilidade e responsividade

Garanta:

uso completo por teclado;

foco visível;

labels associados aos campos;

mensagens de erro acessíveis;

contraste adequado;

áreas de toque confortáveis;

hierarquia correta de títulos;

atributos ARIA quando necessários;

bom funcionamento em telas pequenas;

respeito à preferência de redução de movimento.

Não dependa apenas de cores para transmitir estados.

18. Páginas necessárias

Crie as rotas:

página inicial;

criar currículo;

editar currículo;

visualizar currículo;

meus currículos;

login;

cadastro;

esqueci minha senha;

redefinir senha;

perfil;

termos de uso;

política de privacidade;

página 404.

Proteja somente as páginas que realmente precisam de conta, como “Meus currículos” e “Perfil”.

O editor deve continuar acessível sem autenticação.

19. Critérios obrigatórios de funcionamento

Antes de considerar o projeto concluído, verifique estes fluxos:

Visitante

Entra no site sem cadastro;

Clica em “Criar meu currículo”;

Preenche e edita todas as seções;

Atualiza a página e o rascunho permanece;

Visualiza o currículo;

Clica em salvar ou exportar;

Recebe o modal de login/cadastro somente nesse momento.

Novo usuário

Preenche nome, e-mail e senha;

Não precisa confirmar e-mail;

Entra automaticamente;

Não perde o currículo;

A ação original é retomada;

O currículo é salvo ou exportado corretamente.

Usuário existente

Faz login;

Mantém o currículo que estava editando;

Salva ou exporta;

Acessa posteriormente em “Meus currículos”.

Recuperação de senha

Solicita a redefinição;

Recebe um link seguro;

Cria uma nova senha;

Volta a acessar normalmente.

Segurança

Um usuário não acessa currículos de outro;

Senhas nunca são armazenadas em texto puro;

Dados de visitante não são perdidos durante a autenticação;

Rotas privadas bloqueiam usuários sem sessão;

A exportação gera texto real e compatível com ATS.

20. Resultado final

Entregue uma aplicação funcional, e não apenas um protótipo visual.

Ao finalizar:

conecte banco e autenticação;

implemente todos os fluxos principais;

corrija erros de TypeScript;

remova elementos de demonstração desnecessários;

teste a navegação;

teste o editor;

teste a persistência do rascunho;

teste cadastro, login e recuperação de senha;

teste salvamento e isolamento dos dados;

teste a exportação em PDF;

revise a responsividade;

revise as regras ATS;

mantenha o código limpo e organizado.

Não altere os requisitos principais, não obrigue cadastro antes da hora e não substitua funcionalidades solicitadas por botões sem funcionamento.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://meucurriculoats.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ef7c1aaf-4883-4d59-a0f9-89032cad4270).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
