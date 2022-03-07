Observaciones:
* Al incorporar por bind volume el theme no se configura por completo la base de datos para que pueda funcionar correctamente el tema.
* Se tiene que cargar el tema anterior por el dashboard, borrarlo manualmente y hacer un ln -s para comenzar a trabajar sobre el nuestro codigo.
* Averiguar que hace el sistema de carga desde el dashboard

¿Que hace el instalador de Prestashop?
* Copia el folder del tema a `themes` y copia los modulos de `/dependencies/modules` del tema a `/modules` de la raiz de prestashop
* Falta revisar que hace `importTranslationToDatabase`

Conclusion:
Por el momento, configurar el prestashop y comenzar a desarrollar se tendra que subir el tema por el dashboard, borrarlo y luego hacer un `ls -s theme_path`.