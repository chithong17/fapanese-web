package com.ktnl.fapanese.mapper;

import com.ktnl.fapanese.dto.request.MaterialRequest;
import com.ktnl.fapanese.dto.response.MaterialResponse;
import com.ktnl.fapanese.entity.Material;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MaterialMapper {

    Material toMaterial(MaterialRequest request);

    MaterialResponse toMaterialResponse(Material material);

    List<MaterialResponse> toMaterialResponseList(List<Material> materials);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateMaterial(@MappingTarget Material target, MaterialRequest request);
}
