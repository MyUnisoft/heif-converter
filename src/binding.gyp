{
  "targets": [
    {
      "target_name": "converter",
      "sources": [
        "lib.cc"
      ],
      "include_dirs": [
        "<!(node -p \"require('node-addon-api').include_dir\")",
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "defines": [ "NAPI_CPP_EXCEPTIONS" ],
      "conditions": [
        [
          "OS==\"linux\"", {
            "variables": {
              "VCPKG_LIB_ROOT%": "<!(echo $VCPKG_LIB_ROOT)",
              "conditions": [
                [
                  "\"<!(echo $VCPKG_LIB_ROOT)\" == \"\"", {
                    "VCPKG_LIB_ROOT%": "/vcpkg/installed/x64-linux"
                  }
                ]
              ]
            },
            "libraries": [
              "<(VCPKG_LIB_ROOT)/lib/libheif.a",
              "<(VCPKG_LIB_ROOT)/lib/libturbojpeg.a",
              "<(VCPKG_LIB_ROOT)/lib/libpng16.a",
              "<(VCPKG_LIB_ROOT)/lib/libde265.a",
              "<(VCPKG_LIB_ROOT)/lib/libx265.a"
            ],
            "include_dirs": [
              "<(VCPKG_LIB_ROOT)/include",
              "<(VCPKG_LIB_ROOT)/include/libheif",
              "<(VCPKG_LIB_ROOT)/include/libpng16"
            ]
          }
        ],
        [
          "OS==\"win\"", {
            "variables": {
              "VCPKG_LIB_ROOT%": "<!(node -e \"console.log(process.env.VCPKG_LIB_ROOT)\")",
              "conditions": [
                [
                  "\"<!(node -e \"console.log(process.env.VCPKG_LIB_ROOT)\")\" == \"undefined\"", {
                    "VCPKG_LIB_ROOT%": "C:/vcpkg/installed/x64-windows"
                  }
                ]
              ]
            },
            "msvs_settings": {
              "VCCLCompilerTool": {
                "ExceptionHandling": 1
              }
            },
            "libraries": [
              "<(VCPKG_LIB_ROOT)/lib/heif.lib",
              "<(VCPKG_LIB_ROOT)/lib/turbojpeg.lib",
              "<(VCPKG_LIB_ROOT)/lib/libpng16.lib"
            ],
            "include_dirs": [
              "<(VCPKG_LIB_ROOT)/include",
              "<(VCPKG_LIB_ROOT)/include/libheif",
              "<(VCPKG_LIB_ROOT)/include/libpng16"
            ],
            "copies": [
              {
                "destination": "<(module_root_dir)/build/Release",
                "files": [
                  "<(VCPKG_LIB_ROOT)/bin/heif.dll",
                  "<(VCPKG_LIB_ROOT)/bin/turbojpeg.dll",
                  "<(VCPKG_LIB_ROOT)/bin/jpeg62.dll",
                  "<(VCPKG_LIB_ROOT)/bin/libde265.dll",
                  "<(VCPKG_LIB_ROOT)/bin/libx265.dll",
                  "<(VCPKG_LIB_ROOT)/bin/libpng16.dll",
                  "<(VCPKG_LIB_ROOT)/bin/zlib1.dll"
                ]
              }
            ]
          }
        ]
      ]
    }
  ]
}
