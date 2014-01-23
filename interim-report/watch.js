var gaze = require('gaze'),
    sys   = require('sys'),
    spawn = require('child_process').spawn,

    compileBibtex = function(cb){
      var bibtex      = spawn('bibtex', ['main']);
      // bibtex.stderr.pipe(process.stderr);
      // bibtex.stdout.pipe(process.stdout);
      bibtex.on('exit', function (code) {
        // console.log('bibtex: ' + code);
        if(code != 0){
          console.error("bibtex exited with error " + code);
        }
        if(cb != undefined) cb();
      });
    },

    displayErrors = function(){
      //grep -n -A 1 ^! main.log
      var grep = spawn('grep', ['-n', '-A', '1', '^!', 'main.log']);
      grep.stdout.pipe(process.stdout);
    },

    compileLatex = function(cb){
      var pdflatex      = spawn('pdflatex', ['-interaction=nonstopmode','main']);
      // pdflatex.stderr.pipe(process.stderr);
      // pdflatex.stdout.pipe(process.stdout);
      pdflatex.on('exit', function (code) {
        // console.log('pdflatex: ' + code);
        if(code != 0){
          console.error("pdflatex exited with error " + code);
          displayErrors();
        } else if(cb != undefined) cb();
      });
    },

    compileAll = function(cb){
      console.log("Compiling...");
      compileLatex(function(){
        compileBibtex(function(){
          compileLatex(function(){
            compileLatex(function(){
              console.log("Done.");
            });
          });
        });
      });
    };

// compile first now.
compileAll();

// Watch all .js files/dirs in process.cwd()
gaze(['**/*.tex'], function(err, watcher) {
  // Files have all started watching
  // watcher === this

  // Get all watched files
  console.log("Watching")
  // console.log(this.watched());

  // On file changed
  this.on('changed', function(filepath) {
    console.log(filepath + ' was changed');
    compileAll();
  });

  // On file added
  this.on('added', function(filepath) {
    console.log(filepath + ' was added');
    compileAll();
  });

  // On file deleted
  this.on('deleted', function(filepath) {
    console.log(filepath + ' was deleted');
  });

  // On changed/added/deleted
  this.on('all', function(event, filepath) {
    // console.log(filepath + ' was ' + event);
  });

  // Get watched files with relative paths
  // console.log(this.relative());
});

// // Also accepts an array of patterns
// gaze(['stylesheets/*.css', 'images/**/*.png'], function() {
//   // Add more patterns later to be watched
//   this.add(['js/*.js']);
// });