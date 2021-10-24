module.exports = function(grunt) {
  var srcPath = 'src';
  var docsPath = 'docs';

  var buildPath = 'build';
  var debugPath = 'debug';
  var releasePath = 'release';

  var packageJSON = grunt.file.readJSON('package.json');
  var controlsJSON = grunt.file.readJSON(srcPath+'/controls.json');

  controlsJSON.Lib = packageJSON.name;
  controlsJSON.Version = packageJSON.version;
  controlsJSON.Name = packageJSON.description;
  controlsJSON.Copyright = packageJSON.author.name;

  var normalizeLinebreak = function(text){
    return text.replace(/( |\t)*(\r\n|\n\r|\r|\n)/g,'\n');
  };

  grunt.initConfig({
    pkg: packageJSON,
    clean: [buildPath],
    copy: {
      debug: {
        options: {
          process: function(content){
            return normalizeLinebreak(content);
          }
        },
        files: [{
          cwd: srcPath,
          src: ['**/*.js','!**/libs/**'],
          dest: buildPath+'/'+debugPath,
          expand: true
        }]
      },
      css_debug: {
        options: {
          process: function(content){
            return normalizeLinebreak(content);
          }
        },
        files: [{
          cwd: srcPath,
          src: ['**/*.css','!**/libs/**'],
          dest: buildPath+'/'+debugPath,
          expand: true
        }]
      },
      imgs_debug: {
        files: [{
          cwd: srcPath,
          src: ['**/*.{png,jpg,gif}','!**/libs/**'],
          dest: buildPath+'/'+debugPath,
          expand: true
        }]
      },
      imgs_release: {
        files: [{
          cwd: srcPath,
          src: ['**/*.{png,jpg,gif}','!**/libs/**'],
          dest: buildPath+'/'+releasePath,
          expand: true
        }]
      },
      libs_debug: {
        files: [{
          cwd: srcPath,
          src: '**/libs/debug/**',
          dest: buildPath+'/'+debugPath,
          expand: true,
          rename: function (dest,src){
            return dest+'/'+src.replace('libs/debug','libs');
          }
        }]
      },
      libs_release: {
        files: [{
          cwd: srcPath,
          src: '**/libs/release/**',
          dest: buildPath+'/'+releasePath,
          expand: true,
          rename: function (dest,src){
            return dest+'/'+src.replace('libs/release','libs');
          }
        }]
      },
      license: {
        options: {
          process: function(content){
            return normalizeLinebreak(content);
          }
        },
        files: [
          {
            src: 'LICENSE',
            dest: buildPath+'/'+debugPath,
            expand: true
          },
          {
            src: 'LICENSE',
            dest: buildPath+'/'+releasePath,
            expand: true
          }
        ]
      }
    },
    closureCompiler: {
      options: {
        compilerFile: 'node_jar/closure-compiler.jar',
        compilerOpts: {
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
          jscomp_off: ['misplacedTypeAnnotation']
        }
      },
      release: {
        files: [{
          cwd: srcPath,
          src: ['**/*.js','!**/libs/**'],
          dest: buildPath+'/'+releasePath,
          expand: true
        }]
      }
    },
    cssmin: {
      css_release: {
        files: [{
          cwd: srcPath,
          src: ['**/*.css','!**/libs/**'],
          dest: buildPath+'/'+releasePath,
          expand: true
        }]
      }
    },
    comments: {
      options: {
        keepSpecialComments: false
      },
      remove: {
        files: [{
          cwd: buildPath,
          src: ['**/*.js','**/*.css'],
          dest: buildPath,
          expand: true
        }]
      }
    },
    usebanner: {
      options: {
        linebreak: false,
        process: function(){
          var banner = grunt.file.read('HEADER');
          banner = grunt.template.process(banner);
          return normalizeLinebreak(banner+'\n');
        }
      },
      files: {
        cwd: buildPath,
        src: ['**/*.js','**/*.css'],
        dest: buildPath,
        expand: true
      }
    },
    jsdoc: {
      docs: {
        src: [
          srcPath+'/README.md',
          srcPath+'/package.json',
          srcPath+'/**/*.jsdoc',
          srcPath+'/**/*.js',
          '!**/libs/**'
        ],
        options: {
          destination: docsPath,
          configure: "jsdoc.json"
        }
      }
    },
    replace: {
      docs: {
        src: docsPath+'/**/*.html',
        overwrite: true,
        replacements: [
          { from: /(\r\n|\n\r|\r)/g, to: '\n' },
          { from: /\n\s*\n/g, to: '\n' }
        ]
      }
    }
  });

  grunt.task.registerTask(
    'exportJSON',
    'Exports controls.json file',
    function(){
      if(controlsJSON.Packages){
        for(var packageName in controlsJSON.Packages){
          var package = controlsJSON.Packages[packageName];
          var debugFiles = package.DebugFiles;
          var releaseFiles = package.ReleaseFiles;

          if(debugFiles){
            for(var i in debugFiles){
              debugFiles[i] = debugPath+'/'+debugFiles[i];
            }
          }
          if(releaseFiles){
            for(var j in releaseFiles){
              releaseFiles[j] = releasePath+'/'+releaseFiles[j];
            }
          }
        }
      }
      grunt.file.write(
        buildPath+'/controls.json',
        JSON.stringify(controlsJSON,null,2)
      );
    }
  );

  grunt.registerTask('build',[
    'clean',
    'copy:debug','closureCompiler:release',
    'copy:css_debug','cssmin:css_release',
    'comments:remove','usebanner',
    'copy:imgs_debug','copy:imgs_release',
    'copy:libs_debug','copy:libs_release',
    'exportJSON',
    'copy:license'
  ]);

  grunt.registerTask('docs',[
    'jsdoc:docs','replace:docs'
  ]);

  grunt.registerTask('default','build');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-stripcomments');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-jsdoc');
};