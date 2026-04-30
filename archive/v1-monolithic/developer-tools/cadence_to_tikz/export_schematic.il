;; CIW: Load the script into memory: load("./cadence_to_tikz/export_schematic.il")
;; to export: JL_ExportSchematicToJSON("test_lib" "test_tikz" "schematic" "./cadence_to_tikz/test_tikz.json")

procedure( JL_ExportSchematicToJSON(libName cellName viewName filePath)
    let((cv outPort insts wires pins ptStr bBox cx cy)
        
        cv = dbOpenCellViewByType(libName cellName viewName "" "r")
        if(null(cv) then
            printf("Error: Could not open %s/%s/%s\n" libName cellName viewName)
            return(nil)
        )

        ;; --- FIX 1: Aggressively delete the old file to prevent Virtuoso locks ---
        if(isFile(filePath) then deleteFile(filePath))
        
        outPort = outfile(filePath)
        if(null(outPort) then
            printf("Error: Could not open file %s for writing\n" filePath)
            dbClose(cv)
            return(nil)
        )

        fprintf(outPort "{\n  \"libName\": \"%s\",\n  \"cellName\": \"%s\",\n" cv~>libName cv~>cellName)

        ;; 3. Extract Instances (Components) & Values
        fprintf(outPort "  \"instances\": [\n")
        insts = cv~>instances
        for(i 0 length(insts)-1
            let((inst xy x y propVal net cdf param)
                inst = nth(i insts)
                xy = inst~>xy
                x = xCoord(xy)
                y = yCoord(xy)
                propVal = ""
                
                ;; --- FIX 2: THE NEW EXTRACTION ENGINE ---
                if(inst~>cellName == "ipin" || inst~>cellName == "opin" || inst~>cellName == "iopin" then
                    ;; For pins, the absolute source of truth is the Net name!
                    if(inst~>conns && car(inst~>conns)~>net then
                        propVal = car(inst~>conns)~>net~>name
                    )
                else
                    ;; For components, ask the CDF (Component Description Format) database
                    cdf = cdfGetInstCDF(inst)
                    if(cdf then
                        foreach(pName '("r" "c" "l" "R" "C" "L")
                            param = cdfFindParamByName(cdf pName)
                            ;; Check if it exists and has a value
                            if(param && param~>value && param~>value != "" then
                                if(stringp(param~>value) then
                                    propVal = param~>value
                                else
                                    propVal = sprintf(nil "%g" param~>value)
                                )
                            )
                        )
                    )
                    ;; Fallback to raw props if CDF fails
                    if(propVal == "" then
                        foreach(p inst~>prop
                            if(p~>name == "r" || p~>name == "c" || p~>name == "l" then
                                if(stringp(p~>value) then
                                    propVal = p~>value
                                else
                                    propVal = sprintf(nil "%g" p~>value)
                                )
                            )
                        )
                    )
                )

                fprintf(outPort "    {\"name\": \"%s\", \"lib\": \"%s\", \"cell\": \"%s\", \"x\": %f, \"y\": %f, \"orient\": \"%s\", \"value\": \"%s\"}" 
                    inst~>name inst~>libName inst~>cellName x y inst~>orient propVal)
                if(i < length(insts)-1 then fprintf(outPort ",\n") else fprintf(outPort "\n"))
            )
        )
        fprintf(outPort "  ],\n")

        ;; 4. Extract Wires
        fprintf(outPort "  \"wires\": [\n")
        wires = setof(x cv~>shapes x~>objType == "line")
        for(i 0 length(wires)-1
            let((wire pts)
                wire = nth(i wires)
                pts = wire~>points
                ptStr = buildString(foreach(mapcar p pts sprintf(nil "[%f, %f]" xCoord(p) yCoord(p))) ", ")
                fprintf(outPort "    [%s]" ptStr)
                if(i < length(wires)-1 then fprintf(outPort ",\n") else fprintf(outPort "\n"))
            )
        )
        fprintf(outPort "  ]\n}\n")

        close(outPort)
        dbClose(cv)
        printf("Success: Schematic exported to %s\n" filePath)
        t
    )
)
