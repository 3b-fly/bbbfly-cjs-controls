module.exports = function(grunt) {
  var srcPath = 'src';
  var buildPath = 'build';
  var licenseName = 'LICENSE_GPLv3_with_commercial_exception';

  var packageJSON = grunt.file.readJSON('package.json');
  var controlsJSON = grunt.file.readJSON(srcPath+'/controls.json');

  controlsJSON.Lib = packageJSON.name;
  controlsJSON.Version = packageJSON.version;
  controlsJSON.Name = packageJSON.description;
  controlsJSON.Copyright = packageJSON.author.name;

  grunt.initConfig({
    pkg: packageJSON,
    clean: [buildPath],
    copy: {
      debug: {
        files: [{
          cwd: srcPath,
          src: '**/*.js',
          dest: buildPath+'/debug',
          expand: true
        }]
      },
      license: {
        files: [
          {
            src: licenseName,
            dest: buildPath+'/debug',
            expand: true
          },
          {
            src: licenseName,
            dest: buildPath+'/release',
            expand: true
          }
        ]
      }
    },
    closureCompiler: {
      options: {
        compilerFile: 'node_jar/closure-compiler.jar',
        compilerOpts: {
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
        }
      },
      release: {
        files: [{
          cwd: srcPath,
          src: '**/*.js',
          dest: buildPath+'/release',
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
          src: '**/*.js',
          dest: buildPath,
          expand: true
        }]
      }
    },
    usebanner: {
      options: {
        banner: '/**\n' +
          ' * @author <%= pkg.author.name %> <%= pkg.author.email %>\n' +
          ' * @copyright <%= pkg.author.name %>\n' +
          ' * @version <%= pkg.version %>\n' +
          ' * @license <%= pkg.license %>\n' +
          ' */'
      },
      files: {
        cwd: buildPath,
        src: '**/*.js',
        dest: buildPath,
        expand: true
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
              debugFiles[i] = 'debug/'+debugFiles[i];
            }
          }
          if(releaseFiles){
            for(var j in releaseFiles){
              releaseFiles[j] = 'release/'+releaseFiles[j];
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

  grunt.registerTask('default',[
    'clean',
    'copy:debug','closureCompiler:release',
    'comments:remove',
    'usebanner',
    'exportJSON',
    'copy:license'
  ]);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-stripcomments');
  grunt.loadNpmTasks('grunt-banner');
};